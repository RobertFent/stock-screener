'use client';

import { JSX, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import type { Study } from '@/lib/screener/constants';

type TradingViewWidgetOptions = {
	autosize: boolean;
	symbol: string;
	interval: string;
	theme: string;
	style: string;
	locale: string;
	studies: readonly Study[];
	container_id: string;
	hide_side_toolbar?: boolean;
};

declare global {
	interface Window {
		TradingView?: {
			widget: new (options: TradingViewWidgetOptions) => unknown;
		};
	}
}

const SCRIPT_ID = 'tv-script';
const SCRIPT_SRC = 'https://s3.tradingview.com/tv.js';

let scriptPromise: Promise<void> | null = null;

/**
 * Loads the TradingView bundle exactly once per page load, no matter how many
 * charts mount or how often the selection changes.
 */
const loadTradingViewScript = (): Promise<void> => {
	if (typeof window === 'undefined') {
		return Promise.resolve();
	}
	if (window.TradingView) {
		return Promise.resolve();
	}
	if (scriptPromise) {
		return scriptPromise;
	}

	scriptPromise = new Promise<void>((resolve, reject) => {
		const existing = document.getElementById(
			SCRIPT_ID
		) as HTMLScriptElement | null;

		const script = existing ?? document.createElement('script');
		if (!existing) {
			script.id = SCRIPT_ID;
			script.src = SCRIPT_SRC;
			script.async = true;
			document.body.appendChild(script);
		}

		script.addEventListener('load', () => {
			return resolve();
		});
		script.addEventListener('error', () => {
			scriptPromise = null;
			reject(new Error('Failed to load the TradingView script'));
		});
	});

	return scriptPromise;
};

export const TradingViewChart = ({
	ticker,
	indicators,
	className
}: {
	ticker: string;
	indicators: readonly Study[];
	className?: string;
}): JSX.Element => {
	// a unique container id keeps several charts (and React strict mode double
	// mounts) from fighting over the same DOM node
	const containerId = `tv_chart_${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
	const containerRef = useRef<HTMLDivElement>(null);
	const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
		'loading'
	);

	// studies are recreated by the parent on every render; key on their content
	// so the widget is not rebuilt when nothing actually changed
	const studiesKey = useMemo(() => {
		return indicators
			.map((indicator) => {
				return indicator.label;
			})
			.join('|');
	}, [indicators]);

	useEffect(() => {
		let cancelled = false;
		setStatus('loading');

		loadTradingViewScript()
			.then(() => {
				const container = containerRef.current;
				if (cancelled || !container || !window.TradingView) {
					return;
				}

				container.innerHTML = '';
				new window.TradingView.widget({
					autosize: true,
					symbol: ticker,
					interval: 'D',
					theme: 'dark',
					style: '1',
					locale: 'en',
					studies: indicators,
					container_id: containerId
				});
				setStatus('ready');
			})
			.catch(() => {
				if (!cancelled) {
					setStatus('error');
				}
			});

		return (): void => {
			cancelled = true;
		};
		// `studiesKey` stands in for `indicators` on purpose, see above
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticker, studiesKey, containerId]);

	return (
		<div className={className}>
			<div className='relative h-full w-full'>
				<div
					id={containerId}
					ref={containerRef}
					className='h-full w-full'
				/>
				{status === 'loading' && (
					<div className='absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-card/60 text-sm text-muted-foreground'>
						<Loader2 className='h-4 w-4 animate-spin' />
						Loading chart for {ticker}…
					</div>
				)}
				{status === 'error' && (
					<div className='absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border bg-card text-sm text-muted-foreground'>
						<p>The TradingView chart could not be loaded.</p>
						<a
							className='inline-flex items-center gap-1 underline'
							href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(ticker)}`}
							target='_blank'
							rel='noreferrer'
						>
							Open {ticker} on TradingView
							<ExternalLink className='h-3 w-3' />
						</a>
					</div>
				)}
			</div>
		</div>
	);
};
