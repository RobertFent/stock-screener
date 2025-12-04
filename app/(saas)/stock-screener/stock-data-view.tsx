'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { enrichedStockData, enrichedStockDataList } from '@/lib/db/queries';
import z from '@/node_modules/zod/v4/classic/external.cjs';
import { Dispatch, JSX, SetStateAction, useState } from 'react';

// todo: filter for stochastics and signal line of macd
type Filters = {
	minVolume?: number;
	macdIncreasing?: boolean;
	closeAboveEma20AboveEma50?: boolean;
	maxRSI?: number;
	minIV?: number;
	maxIV?: number;
	minWillr?: number;
	maxWillr?: number;
};

const FilterRow = ({
	filters,
	setFilters
}: {
	filters: Filters;
	setFilters: Dispatch<SetStateAction<Filters>>;
}): JSX.Element => {
	const update = <K extends keyof Filters>(
		key: K,
		value: Filters[K]
	): void => {
		setFilters((prevFilters) => {
			return {
				...prevFilters,
				[key]: value
			};
		});
	};
	return (
		<div className='w-full rounded-xl border p-4 bg-card shadow-sm'>
			<h3 className='text-lg font-semibold mb-4'>Filters</h3>

			<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{/* --- Volume --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Volume
					</label>
					<Input
						type='number'
						placeholder='Min. Volume'
						value={filters.minVolume ?? ''}
						onChange={(e) => {
							return update('minVolume', Number(e.target.value));
						}}
					/>
				</div>

				{/* --- RSI --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. RSI
					</label>
					<Input
						type='number'
						placeholder='Max. RSI'
						value={filters.maxRSI ?? ''}
						onChange={(e) => {
							return update('maxRSI', Number(e.target.value));
						}}
					/>
				</div>

				{/* --- IV --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. IV
					</label>
					<Input
						type='number'
						placeholder='Min. IV'
						value={filters.minIV ?? ''}
						onChange={(e) => {
							return update('minIV', Number(e.target.value));
						}}
					/>
				</div>

				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. IV
					</label>
					<Input
						type='number'
						placeholder='Max. IV'
						value={filters.maxIV ?? ''}
						onChange={(e) => {
							return update('maxIV', Number(e.target.value));
						}}
					/>
				</div>
			</div>

			{/* --- SWITCHES --- */}
			<div className='mt-6 flex flex-col md:flex-row md:items-center gap-4'>
				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={filters.closeAboveEma20AboveEma50 ?? false}
						onCheckedChange={(v) => {
							return update('closeAboveEma20AboveEma50', v);
						}}
					/>
					Close &gt; EMA20 &gt; EMA50
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={filters.macdIncreasing ?? false}
						onCheckedChange={(v) => {
							return update('macdIncreasing', v);
						}}
					/>
					MACD increasing (last 3 days)
				</label>
			</div>
		</div>
	);
};

export default function StockDataView({
	stocks
}: {
	stocks: z.infer<typeof enrichedStockDataList>;
}): JSX.Element {
	// todo: setting default values but should be saved somewhere in database
	const [filters, setFilters] = useState<Filters>({
		minVolume: 1000000,
		maxRSI: 60,
		minIV: 30,
		maxIV: 70,
		macdIncreasing: true,
		closeAboveEma20AboveEma50: true
	});
	const [selectedStock, setSelectedStock] =
		useState<z.infer<typeof enrichedStockData>>();

	const filteredStocks = stocks.filter((stock) => {
		if (filters.minVolume && Number(stock.volume) < filters.minVolume) {
			return false;
		}
		if (filters.maxRSI && stock.rsi > filters.maxRSI) {
			return false;
		}
		if (filters.minIV && stock.iv < filters.minIV) {
			return false;
		}
		if (filters.maxIV && stock.rsi > filters.maxIV) {
			return false;
		}
		if (
			filters.macdIncreasing &&
			(stock.macd_line < stock.macd_line_prev_day ||
				stock.macd_line_prev_day < stock.macd_line_prev_prev_day)
		) {
			return false;
		}
		if (
			filters.closeAboveEma20AboveEma50 &&
			(stock.close < stock.ema20 || stock.ema20 < stock.ema50)
		) {
			return false;
		}
		return true;
	});

	return (
		<>
			<FilterRow filters={filters} setFilters={setFilters}></FilterRow>
			<div className='flex flex-row gap-4 mt-10 max-h-[80vh]'>
				<div className='basis-1/4 overflow-auto'>
					<>
						<h1 className='text-center mb-4'>Matching Symbols</h1>
						{filteredStocks.map((stock) => {
							return (
								<Button
									variant='outline'
									key={stock.id}
									className='w-full mb-2'
									onClick={() => {
										setSelectedStock(stock);
									}}
								>
									{stock.ticker}
								</Button>
							);
						})}
					</>
				</div>
				<div className='basis-3/4 text-center overflow-auto'>
					<div className='font-bold text-3xl mb-10'>
						Here will be some stock information and a proper chart
					</div>
					{selectedStock ? (
						<div className='mt-10'>
							<p>Ticker: {selectedStock.ticker}</p>
							<p>Date: {selectedStock.date}</p>
							<p>Close: {selectedStock.close}</p>
							<p>High: {selectedStock.high}</p>
							<p>Low: {selectedStock.low}</p>
							<p>Open: {selectedStock.open}</p>
							<p>Volume: {selectedStock.volume}</p>
							<p>EMA20: {selectedStock.ema20}</p>
							<p>EMA50: {selectedStock.ema50}</p>
							<p>Macd Line: {selectedStock.macd_line}</p>
							<p>
								Macd Line Prev. Day:{' '}
								{selectedStock.macd_line_prev_day}
							</p>
							<p>
								Macd Line Prev. Prev. Day:{' '}
								{selectedStock.macd_line_prev_prev_day}
							</p>
							<p>Signal Line: {selectedStock.signal_line}</p>
							<p>RSI: {selectedStock.rsi}</p>
							<p>IV: {selectedStock.iv}</p>
							<p>WILLR: {selectedStock.willr}</p>
							<p>
								Stochastic %K: {selectedStock.stoch_percent_k}
							</p>
							<p>
								Stochastic %D: {selectedStock.stoch_percent_d}
							</p>
							<p>
								Last Updated At: {selectedStock.last_updated_at}
							</p>
						</div>
					) : (
						<div className='text-xl'>
							Please select a symbol to see its data
						</div>
					)}
				</div>
			</div>
		</>
	);
}
