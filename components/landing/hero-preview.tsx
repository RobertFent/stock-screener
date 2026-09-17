import { JSX } from 'react';

import { cn } from '@/lib/utils';

/*
 * A schematic of the screener for the marketing hero: the real layout and the
 * real tokens, with sample values. It is decorative (aria-hidden) and renders
 * on the server - no images, no client JavaScript.
 */

const ROWS = [
	{ ticker: 'AAPL', close: '214.06', adr: '2.2', rsi: '28.4' },
	{ ticker: 'ABNB', close: '244.69', adr: '4.3', rsi: '19.3' },
	{ ticker: 'AMD', close: '185.62', adr: '6.7', rsi: '40.7' },
	{ ticker: 'CRWD', close: '288.10', adr: '3.9', rsi: '26.1' },
	{ ticker: 'MU', close: '104.18', adr: '5.1', rsi: '85.8' },
	{ ticker: 'NFLX', close: '702.44', adr: '3.6', rsi: '23.7' },
	{ ticker: 'PANW', close: '368.52', adr: '2.8', rsi: '31.5' }
];

const PRICE_PATH =
	'M0 70 L16 63 L32 68 L48 55 L64 59 L80 45 L96 50 L112 36 L128 41 L144 28 L160 33 L176 21 L192 26 L208 14';

const rsiTone = (value: string): string => {
	const parsed = Number(value);
	if (parsed <= 30) {
		return 'text-bullish';
	}
	if (parsed >= 70) {
		return 'text-bearish';
	}
	return 'text-foreground';
};

const Field = ({
	label,
	value,
	active = false
}: {
	label: string;
	value: string;
	active?: boolean;
}): JSX.Element => {
	return (
		<div className='flex min-w-0 flex-col gap-0.5'>
			<span
				className={cn(
					'truncate text-[8px] font-medium tracking-wide uppercase',
					active ? 'text-primary' : 'text-muted-foreground'
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					'bg-input flex h-5 items-center rounded border px-1.5 text-[10px] tabular',
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

export const HeroPreview = (): JSX.Element => {
	return (
		<div
			aria-hidden
			className='border-hairline bg-surface-1 shadow-elevation-3 overflow-hidden rounded-2xl border'
		>
			{/* window chrome */}
			<div className='border-hairline bg-surface-2 flex items-center gap-2 border-b px-3 py-2'>
				<span className='flex gap-1'>
					<span className='bg-border-strong size-2 rounded-full' />
					<span className='bg-border-strong size-2 rounded-full' />
					<span className='bg-border-strong size-2 rounded-full' />
				</span>
				<span className='text-muted-foreground/70 mx-auto rounded bg-black/20 px-2 py-0.5 text-[10px]'>
					/stock-screener?maxRSI4=30&amp;minAdrPercent7=3
				</span>
			</div>

			<div className='flex flex-col gap-2 p-2.5'>
				{/* filter strip */}
				<div className='border-hairline bg-card rounded-lg border p-2'>
					<div className='flex items-center gap-1.5'>
						<span className='border-border-strong bg-surface-2 flex h-5 items-center rounded px-1.5 text-[10px]'>
							Momentum reversal
						</span>
						<span className='border-primary/30 bg-primary/12 text-primary rounded-full border px-1.5 text-[9px]'>
							4 active
						</span>
						<span className='text-muted-foreground/60 ml-auto text-[9px]'>
							Hide filters
						</span>
					</div>
					<div className='mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5'>
						<Field label='Indices' value='All' />
						<Field label='Min ADR%' value='3' active />
						<Field label='Max RSI 4' value='30' active />
						<Field label='Min price' value='20' active />
						<Field label='Max IV' value='–' />
					</div>
				</div>

				<div className='grid gap-2 sm:grid-cols-[38%_1fr]'>
					{/* results */}
					<div className='border-hairline bg-card rounded-lg border p-2'>
						<div className='flex items-baseline justify-between'>
							<span className='text-muted-foreground text-[8px] font-semibold tracking-wider uppercase'>
								Matches
							</span>
							<span className='text-muted-foreground text-[9px] tabular'>
								<span className='text-foreground font-medium'>
									7
								</span>
								/150
							</span>
						</div>
						<table className='mt-1.5 w-full border-collapse text-[10px]'>
							<thead>
								<tr className='text-muted-foreground border-border/60 border-b text-[8px] tracking-wide uppercase'>
									<th className='py-0.5 text-left font-medium'>
										Sym
									</th>
									<th className='py-0.5 text-right font-medium'>
										Close
									</th>
									<th className='py-0.5 text-right font-medium'>
										ADR%
									</th>
									<th className='py-0.5 text-right font-medium'>
										RSI4
									</th>
								</tr>
							</thead>
							<tbody>
								{ROWS.map((row, index) => {
									return (
										<tr
											key={row.ticker}
											className={cn(
												'border-border/30 border-b',
												index === 0 &&
													'bg-surface-2 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
											)}
										>
											<td
												className={cn(
													'py-[3px] pl-1.5 font-medium',
													index === 0 &&
														'text-primary'
												)}
											>
												{row.ticker}
											</td>
											<td className='py-[3px] text-right tabular'>
												{row.close}
											</td>
											<td
												className={cn(
													'py-[3px] text-right tabular',
													Number(row.adr) >= 4
														? 'text-primary'
														: 'text-foreground'
												)}
											>
												{row.adr}
											</td>
											<td
												className={cn(
													'py-[3px] pr-1.5 text-right tabular',
													rsiTone(row.rsi)
												)}
											>
												{row.rsi}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{/* chart */}
					<div className='border-hairline bg-card flex flex-col rounded-lg border p-2'>
						<div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
							<span className='text-xs font-semibold'>AAPL</span>
							<span className='border-border-strong bg-surface-3 text-muted-foreground rounded-full border px-1.5 text-[8px]'>
								S&amp;P 100
							</span>
							<span className='text-[9px] tabular'>
								<span className='text-muted-foreground'>
									CLOSE{' '}
								</span>
								$214.06
							</span>
							<span className='text-[9px] tabular'>
								<span className='text-muted-foreground'>
									ADR%{' '}
								</span>
								2.2%
							</span>
						</div>

						<svg
							viewBox='0 0 208 84'
							className='mt-1.5 w-full flex-1'
							role='presentation'
						>
							<defs>
								<linearGradient
									id='hero-preview-fill'
									x1='0'
									y1='0'
									x2='0'
									y2='1'
								>
									<stop
										offset='0%'
										className='text-primary'
										stopColor='currentColor'
										stopOpacity='0.28'
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
								d={`${PRICE_PATH} L208 84 L0 84 Z`}
								fill='url(#hero-preview-fill)'
							/>
							<path
								d={PRICE_PATH}
								fill='none'
								strokeWidth='1.75'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='stroke-primary'
							/>
							<path
								d='M0 62 L52 58 L104 50 L156 44 L208 38'
								fill='none'
								strokeWidth='1'
								strokeDasharray='3 3'
								className='stroke-muted-foreground'
							/>
						</svg>

						<div className='mt-1.5 flex flex-wrap gap-1'>
							{[
								{ label: 'Close > MA200', on: true },
								{ label: 'MACD > signal', on: true },
								{ label: '%K > %D', on: false }
							].map((chip) => {
								return (
									<span
										key={chip.label}
										className={cn(
											'rounded-full border px-1.5 text-[8px]',
											chip.on
												? 'border-bullish/30 bg-bullish/12 text-bullish'
												: 'border-border text-muted-foreground/70'
										)}
									>
										{chip.on ? '✓' : '✕'} {chip.label}
									</span>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
