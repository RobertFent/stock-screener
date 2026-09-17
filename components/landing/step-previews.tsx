import { JSX } from 'react';
import { Check, RotateCcw, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/*
 * Illustrative previews of the product's own interface, built from the same
 * tokens as the app itself so they cannot drift away from the real design.
 * The values are sample data, not live market data - each preview says so.
 */

const SampleNote = ({ children }: { children: string }): JSX.Element => {
	return (
		<p className='text-muted-foreground/60 mt-2 text-[11px]'>{children}</p>
	);
};

const Frame = ({
	children,
	className
}: {
	children: React.ReactNode;
	className?: string;
}): JSX.Element => {
	return (
		<div
			aria-hidden
			className={cn(
				'border-hairline bg-surface-1 shadow-elevation-2 overflow-hidden rounded-2xl border p-3',
				className
			)}
		>
			{children}
		</div>
	);
};

const FieldChip = ({
	label,
	value,
	active = false
}: {
	label: string;
	value: string;
	active?: boolean;
}): JSX.Element => {
	return (
		<div className='flex flex-col gap-1'>
			<span
				className={cn(
					'text-[10px] font-medium tracking-wide uppercase',
					active ? 'text-primary' : 'text-muted-foreground'
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					'bg-input flex h-7 items-center rounded-md border px-2 text-[12px] tabular',
					active
						? 'border-primary/40 text-foreground'
						: 'border-border-strong text-muted-foreground/60'
				)}
			>
				{value}
			</span>
		</div>
	);
};

const ConditionChip = ({
	label,
	on = false
}: {
	label: string;
	on?: boolean;
}): JSX.Element => {
	return (
		<span
			className={cn(
				'flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]',
				on
					? 'border-primary/40 bg-primary/8 text-foreground'
					: 'border-border bg-surface-1 text-muted-foreground'
			)}
		>
			<span
				className={cn(
					'h-2.5 w-4 rounded-full',
					on ? 'bg-primary' : 'bg-surface-3'
				)}
			/>
			{label}
		</span>
	);
};

/** Step 1 — choosing and saving a filter preset. */
export const FilterPreview = (): JSX.Element => {
	return (
		<div>
			<Frame>
				<div className='flex flex-wrap items-center gap-2'>
					<span className='border-border-strong bg-surface-2 flex h-7 w-44 items-center justify-between rounded-md border px-2 text-[12px]'>
						Momentum reversal
						<Star className='fill-primary text-primary size-3' />
					</span>
					<span className='border-border-strong text-muted-foreground flex h-7 items-center rounded-md border px-2 text-[12px]'>
						Update
					</span>
					<span className='text-muted-foreground flex h-7 items-center gap-1 rounded-md px-2 text-[12px]'>
						<RotateCcw className='size-3' />
						Reset
					</span>
					<Badge size='sm'>4 active</Badge>
				</div>

				<div className='border-hairline mt-3 grid grid-cols-2 gap-x-5 gap-y-3 border-t pt-3 sm:grid-cols-4'>
					<FieldChip label='Indices' value='All indices' />
					<FieldChip label='Min ADR%' value='3' active />
					<FieldChip label='Min price' value='20' active />
					<FieldChip label='Max RSI 4' value='30' active />
				</div>

				<div className='mt-3 flex flex-wrap gap-1.5'>
					<ConditionChip label='Close > MA200' on />
					<ConditionChip label='MACD rising (3d)' />
					<ConditionChip label='%K > %D' />
				</div>
			</Frame>
			<SampleNote>Sample preset — values are illustrative.</SampleNote>
		</div>
	);
};

const CHART_PATH =
	'M0 74 L18 66 L36 71 L54 58 L72 61 L90 47 L108 52 L126 38 L144 43 L162 30 L180 34 L198 22 L216 27 L234 16';

/** Step 2 — picking which studies the chart shows. */
export const ChartPreview = (): JSX.Element => {
	const studies = [
		{ label: 'RSI(14)', selected: true },
		{ label: 'MACD(12, 26, 9)', selected: true },
		{ label: 'Stoch(14, 3, 3)', selected: true },
		{ label: 'EMA(20)', selected: false },
		{ label: 'MA(200)', selected: false }
	];

	return (
		<div>
			<Frame className='flex flex-col gap-3 sm:flex-row'>
				<div className='border-hairline bg-card min-w-0 flex-1 rounded-xl border p-3'>
					<div className='flex items-baseline gap-2'>
						<span className='text-sm font-semibold'>AAPL</span>
						<Badge variant='neutral' size='sm'>
							S&amp;P 100
						</Badge>
					</div>
					<svg
						viewBox='0 0 234 90'
						className='mt-2 h-24 w-full'
						role='presentation'
					>
						<defs>
							<linearGradient
								id='preview-fill'
								x1='0'
								y1='0'
								x2='0'
								y2='1'
							>
								<stop
									offset='0%'
									className='text-primary'
									stopColor='currentColor'
									stopOpacity='0.25'
								/>
								<stop
									offset='100%'
									className='text-primary'
									stopColor='currentColor'
									stopOpacity='0'
								/>
							</linearGradient>
						</defs>
						<path
							d={`${CHART_PATH} L234 90 L0 90 Z`}
							fill='url(#preview-fill)'
						/>
						<path
							d={CHART_PATH}
							fill='none'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='stroke-primary'
						/>
					</svg>
					<div className='border-hairline mt-2 border-t pt-2'>
						<svg
							viewBox='0 0 234 24'
							className='h-6 w-full'
							role='presentation'
						>
							<path
								d='M0 18 L26 14 L52 16 L78 9 L104 12 L130 7 L156 10 L182 5 L208 8 L234 4'
								fill='none'
								strokeWidth='1.5'
								className='stroke-muted-foreground'
							/>
						</svg>
					</div>
				</div>

				<div className='border-hairline bg-card w-full shrink-0 rounded-xl border p-3 sm:w-44'>
					<p className='text-muted-foreground text-[10px] font-semibold tracking-wider uppercase'>
						Chart indicators (3/3)
					</p>
					<ul className='mt-2 space-y-1.5'>
						{studies.map((study) => {
							return (
								<li
									key={study.label}
									className={cn(
										'flex items-center gap-2 text-[12px]',
										study.selected
											? 'text-foreground'
											: 'text-muted-foreground/50'
									)}
								>
									<span
										className={cn(
											'flex size-3.5 items-center justify-center rounded border',
											study.selected
												? 'border-primary bg-primary text-primary-foreground'
												: 'border-border-strong'
										)}
									>
										{study.selected && (
											<Check className='size-2.5' />
										)}
									</span>
									{study.label}
								</li>
							);
						})}
					</ul>
				</div>
			</Frame>
			<SampleNote>
				Schematic chart — the app renders a full TradingView chart.
			</SampleNote>
		</div>
	);
};

const ROWS = [
	{ ticker: 'AAPL', close: '214.06', adr: '2.2', rsi: '28.4', k: '18.2' },
	{ ticker: 'ABNB', close: '244.69', adr: '4.3', rsi: '19.3', k: '11.4' },
	{ ticker: 'AMD', close: '185.62', adr: '6.7', rsi: '40.7', k: '34.1' },
	{ ticker: 'MU', close: '104.18', adr: '5.1', rsi: '85.8', k: '82.2' },
	{ ticker: 'NFLX', close: '702.44', adr: '3.6', rsi: '23.7', k: '49.2' }
];

const tone = (value: string, lower: number, upper: number): string => {
	const parsed = Number(value);
	if (parsed <= lower) {
		return 'text-bullish';
	}
	if (parsed >= upper) {
		return 'text-bearish';
	}
	return 'text-foreground';
};

/** Step 3 — scanning and sharing the matches. */
export const ResultsPreview = (): JSX.Element => {
	return (
		<div>
			<Frame>
				<div className='flex items-baseline justify-between'>
					<span className='text-muted-foreground text-[10px] font-semibold tracking-wider uppercase'>
						Matches
					</span>
					<span className='text-muted-foreground text-[11px] tabular'>
						<span className='text-foreground font-medium'>12</span>{' '}
						/ 150
					</span>
				</div>

				<table className='mt-2 w-full border-collapse text-[12px]'>
					<thead>
						<tr className='border-hairline text-muted-foreground border-b text-[10px] tracking-wide uppercase'>
							<th className='py-1 text-left font-medium'>
								Symbol
							</th>
							<th className='py-1 text-right font-medium'>
								Close
							</th>
							<th className='py-1 text-right font-medium'>
								ADR%
							</th>
							<th className='py-1 text-right font-medium'>
								RSI4
							</th>
							<th className='py-1 text-right font-medium'>%K</th>
						</tr>
					</thead>
					<tbody>
						{ROWS.map((row, index) => {
							return (
								<tr
									key={row.ticker}
									className={cn(
										'border-border/40 border-b',
										index === 0 &&
											'bg-surface-2 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
									)}
								>
									<td
										className={cn(
											'py-1.5 pl-2 font-medium',
											index === 0 && 'text-primary'
										)}
									>
										{row.ticker}
									</td>
									<td className='py-1.5 text-right tabular'>
										{row.close}
									</td>
									<td
										className={cn(
											'py-1.5 text-right tabular',
											Number(row.adr) >= 4
												? 'text-primary font-medium'
												: 'text-foreground'
										)}
									>
										{row.adr}
									</td>
									<td
										className={cn(
											'py-1.5 text-right tabular',
											tone(row.rsi, 30, 70)
										)}
									>
										{row.rsi}
									</td>
									<td
										className={cn(
											'py-1.5 pr-2 text-right tabular',
											tone(row.k, 20, 80)
										)}
									>
										{row.k}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				<div className='border-hairline text-muted-foreground mt-2 flex items-center gap-2 border-t pt-2 text-[11px]'>
					<span className='bg-surface-3 rounded px-1.5 py-0.5 font-mono'>
						/stock-screener?maxRSI4=30&amp;minAdrPercent7=3
					</span>
					<span className='whitespace-nowrap'>← shareable</span>
				</div>
			</Frame>
			<SampleNote>Sample rows — values are illustrative.</SampleNote>
		</div>
	);
};
