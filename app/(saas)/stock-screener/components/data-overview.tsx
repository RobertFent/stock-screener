'use client';

import { JSX } from 'react';
import { HelpCircle } from 'lucide-react';
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

type Stat = {
	label: string;
	value: string;
	tooltip?: string;
};

const Chip = ({
	label,
	active
}: {
	label: string;
	active: boolean | null;
}): JSX.Element => {
	return (
		<span
			className={cn(
				'rounded-full border px-2 py-0.5 text-xs',
				active === null && 'border-border text-muted-foreground',
				active === true && 'border-primary/60 text-primary',
				active === false && 'border-border/60 text-muted-foreground/60'
			)}
		>
			{active === true ? '✓' : active === false ? '✕' : '–'} {label}
		</span>
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
					: `${formatCurrency(stock.adr_7)} (${formatPercent(adr7Percent)})`,
			tooltip: 'Average daily range over the last 7 sessions'
		},
		{
			label: 'ADR 14',
			value: formatCurrency(stock.adr_14),
			tooltip: 'Average daily range over the last 14 sessions'
		},
		{
			label: 'Implied volatility',
			value: formatNumber(stock.iv),
			tooltip: 'IV(30)'
		},
		{ label: 'RSI 4', value: formatNumber(stock.rsi_4), tooltip: 'RSI(4)' },
		{
			label: 'RSI 14',
			value: formatNumber(stock.rsi_14),
			tooltip: 'RSI(14)'
		},
		{
			label: 'Williams %R 4',
			value: formatPercent(stock.willr_4),
			tooltip: 'willr(4)'
		},
		{
			label: 'Williams %R 14',
			value: formatPercent(stock.willr_14),
			tooltip: 'willr(14)'
		},
		{
			label: 'Stochastic %K / %D',
			value: `${formatNumber(stock.stoch_percent_k)} / ${formatNumber(stock.stoch_percent_d)}`,
			tooltip: 'stochastic slow(14, 3, 3)'
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
			label: 'Signal date (AMC)',
			value: formatDate(stock.date),
			tooltip: 'Trading day the indicator values were calculated for'
		},
		{
			label: 'Last updated',
			value: formatDate(stock.last_updated_at),
			tooltip:
				'Stock data is refreshed every day at 6:15am UTC. If you do not see the latest data, reload the page.'
		}
	];

	return (
		<div className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-left shadow-sm'>
			<div className='flex flex-wrap gap-2'>
				<Chip
					label='Close > MA200'
					active={ma200 === null ? null : stock.close >= ma200}
				/>
				<Chip
					label='Close > EMA20 > EMA50'
					active={
						stock.close >= stock.ema20 && stock.ema20 >= stock.ema50
					}
				/>
				<Chip
					label='MACD > signal'
					active={stock.macd_line > stock.signal_line}
				/>
				<Chip
					label='MACD rising'
					active={
						stock.macd_line_prev_day === null ||
						stock.macd_line_prev_prev_day === null
							? null
							: stock.macd_line >= stock.macd_line_prev_day &&
								stock.macd_line_prev_day >=
									stock.macd_line_prev_prev_day
					}
				/>
				<Chip
					label='%K > %D'
					active={stock.stoch_percent_k > stock.stoch_percent_d}
				/>
			</div>

			<dl className='grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4'>
				{stats.map((stat) => {
					return (
						<div key={stat.label} className='flex flex-col'>
							<dt className='flex items-center gap-1 text-xs text-muted-foreground'>
								{stat.label}
								{stat.tooltip && (
									<Tooltip>
										<TooltipTrigger asChild>
											<span className='cursor-pointer'>
												<HelpCircle size={12} />
											</span>
										</TooltipTrigger>
										<TooltipContent className='max-w-64 text-left'>
											{stat.tooltip}
										</TooltipContent>
									</Tooltip>
								)}
							</dt>
							<dd className='text-sm tabular-nums'>
								{stat.value}
							</dd>
						</div>
					);
				})}
			</dl>
		</div>
	);
};
