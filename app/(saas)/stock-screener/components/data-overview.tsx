'use client';

import { JSX } from 'react';
import { HelpCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { EnrichedStockData } from '@/lib/schemas/stockSchemas';
import {
	adrPercent,
	formatCompact,
	formatCurrency,
	formatDate,
	formatNumber,
	formatPercent,
	toNumberOrNull,
	EM_DASH
} from '@/lib/screener/format';
import { rsiTone, stochTone, toneClass, willrTone } from '@/lib/screener/tone';

type Stat = {
	label: string;
	value: string;
	tooltip?: string;
	className?: string;
};

/** A condition the screener can filter on, shown as pass / fail / unknown. */
const ConditionChip = ({
	label,
	state
}: {
	label: string;
	state: boolean | null;
}): JSX.Element => {
	return (
		<Badge
			variant={state === null ? 'muted' : state ? 'bullish' : 'neutral'}
			className={cn(state === false && 'opacity-60')}
		>
			<span aria-hidden>{state === null ? '–' : state ? '✓' : '✕'}</span>
			{label}
		</Badge>
	);
};

export const DataOverview = ({
	stock
}: {
	stock: EnrichedStockData;
}): JSX.Element => {
	const ma200 = toNumberOrNull(stock.ma_200);
	const adr7Percent = adrPercent(stock.adr_7, stock.close);

	const stats: Stat[] = [
		{ label: 'Close', value: formatCurrency(stock.close) },
		{ label: 'Volume', value: formatCompact(stock.volume) },
		{
			label: 'ADR 7',
			value:
				adr7Percent === null
					? formatCurrency(stock.adr_7)
					: `${formatCurrency(stock.adr_7)} · ${formatPercent(adr7Percent, 1)}`,
			tooltip: 'Average daily range over the last 7 sessions'
		},
		{
			label: 'ADR 14',
			value: formatCurrency(stock.adr_14),
			tooltip: 'Average daily range over the last 14 sessions'
		},
		{
			label: 'IV',
			value: formatNumber(stock.iv),
			tooltip: 'Implied volatility, IV(30)'
		},
		{
			label: 'RSI 4',
			value: formatNumber(stock.rsi_4),
			tooltip: 'RSI(4)',
			className: toneClass(rsiTone(stock.rsi_4))
		},
		{
			label: 'RSI 14',
			value: formatNumber(stock.rsi_14),
			tooltip: 'RSI(14)',
			className: toneClass(rsiTone(stock.rsi_14))
		},
		{
			label: '%R 4',
			value: formatNumber(stock.willr_4, 1),
			tooltip: 'Williams %R(4)',
			className: toneClass(willrTone(stock.willr_4))
		},
		{
			label: '%R 14',
			value: formatNumber(stock.willr_14, 1),
			tooltip: 'Williams %R(14)',
			className: toneClass(willrTone(stock.willr_14))
		},
		{
			label: '%K / %D',
			value: `${formatNumber(stock.stoch_percent_k, 1)} / ${formatNumber(stock.stoch_percent_d, 1)}`,
			tooltip: 'stochastic slow(14, 3, 3)',
			className: toneClass(stochTone(stock.stoch_percent_k))
		},
		{
			label: 'MACD / signal',
			value: `${formatNumber(stock.macd_line, 3)} / ${formatNumber(stock.signal_line, 3)}`,
			tooltip: 'macd(26, 12, 9)'
		},
		{
			label: 'EMA 20 / 50',
			value: `${formatNumber(stock.ema20)} / ${formatNumber(stock.ema50)}`
		},
		{
			label: 'MA 200',
			value: ma200 === null ? EM_DASH : formatNumber(ma200)
		},
		{
			label: 'Signal date',
			value: formatDate(stock.date),
			tooltip: 'Trading day the indicator values were calculated for'
		}
	];

	return (
		<section className='border-hairline bg-card shadow-elevation-1 flex flex-col gap-3 rounded-xl border p-3'>
			<div className='flex flex-wrap gap-1.5'>
				<ConditionChip
					label='Close > MA200'
					state={ma200 === null ? null : stock.close >= ma200}
				/>
				<ConditionChip
					label='Close > EMA20 > EMA50'
					state={
						stock.close >= stock.ema20 && stock.ema20 >= stock.ema50
					}
				/>
				<ConditionChip
					label='MACD > signal'
					state={stock.macd_line > stock.signal_line}
				/>
				<ConditionChip
					label='MACD rising'
					state={
						stock.macd_line_prev_day === null ||
						stock.macd_line_prev_prev_day === null
							? null
							: stock.macd_line >= stock.macd_line_prev_day &&
								stock.macd_line_prev_day >=
									stock.macd_line_prev_prev_day
					}
				/>
				<ConditionChip
					label='%K > %D'
					state={stock.stoch_percent_k > stock.stoch_percent_d}
				/>
			</div>

			<dl className='grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4 xl:grid-cols-7'>
				{stats.map((stat) => {
					return (
						<div key={stat.label} className='min-w-0'>
							<dt className='text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase'>
								<span className='truncate'>{stat.label}</span>
								{stat.tooltip && (
									<Tooltip>
										<TooltipTrigger asChild>
											<span className='text-muted-foreground/60 hover:text-muted-foreground cursor-help'>
												<HelpCircle className='size-3' />
											</span>
										</TooltipTrigger>
										<TooltipContent className='text-left'>
											{stat.tooltip}
										</TooltipContent>
									</Tooltip>
								)}
							</dt>
							<dd
								className={cn(
									'truncate text-sm tabular',
									stat.className
								)}
							>
								{stat.value}
							</dd>
						</div>
					);
				})}
			</dl>
		</section>
	);
};
