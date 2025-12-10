'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { enrichedStockData, enrichedStockDataList } from '@/lib/db/queries';
import z from '@/node_modules/zod/v4/classic/external.cjs';
import {
	Dispatch,
	JSX,
	SetStateAction,
	useCallback,
	useEffect,
	useState
} from 'react';

type Filters = {
	minVolume?: number;
	macdIncreasing?: boolean;
	macdLineAboveSignal?: boolean;
	closeAboveEma20AboveEma50?: boolean;
	stochasticsKAbvoeD?: boolean;
	maxRSI?: number;
	minIV?: number;
	maxIV?: number;
	minWillr?: number;
	maxWillr?: number;
	minStochK?: number;
	maxStochK?: number;
};

const FilterRow = ({
	filters,
	setFilters
}: {
	filters: Filters;
	setFilters: Dispatch<SetStateAction<Filters>>;
}): JSX.Element => {
	const onInputChange = (target: HTMLInputElement, key: string): void => {
		const value = target.value === '' ? undefined : Number(target.value);
		setFilters((prevFilters) => {
			return {
				...prevFilters,
				[key]: value
			};
		});
	};
	const onCheckboxChange = (value: boolean, key: string): void => {
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

			{/* // todo: put into one component and re-use */}
			<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{/* --- Volume --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Volume
					</label>
					<Input
						type='number'
						placeholder='-'
						value={filters.minVolume ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minVolume');
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
						placeholder='-'
						value={filters.maxRSI ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxRSI');
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
						placeholder='-'
						value={filters.minIV ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minIV');
						}}
					/>
				</div>

				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. IV
					</label>
					<Input
						type='number'
						placeholder='-'
						value={filters.maxIV ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxIV');
						}}
					/>
				</div>

				{/* --- WILLR --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Williams %R
					</label>
					<Input
						type='number'
						placeholder='-'
						value={filters.minWillr ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minWillr');
						}}
					/>
				</div>
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. Williams %R
					</label>
					<Input
						type='number'
						placeholder='-'
						value={filters.maxWillr ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxWillr');
						}}
					/>
				</div>

				{/* --- Stochastics --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Stochastics %K
					</label>
					<Input
						type='number'
						placeholder='-'
						value={filters.minStochK ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minStochK');
						}}
					/>
				</div>
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. Stochastics %K
					</label>
					<Input
						type='number'
						placeholder='-'
						value={filters.maxStochK ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxStochK');
						}}
					/>
				</div>
			</div>

			{/* --- SWITCHES --- */}
			{/* // todo: put into one component and re-use */}
			<div className='mt-6 flex flex-col md:flex-row md:items-center gap-4'>
				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={filters.closeAboveEma20AboveEma50 ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(
								v,
								'closeAboveEma20AboveEma50'
							);
						}}
					/>
					Close &gt; EMA20 &gt; EMA50
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={filters.macdIncreasing ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(v, 'macdIncreasing');
						}}
					/>
					MACD increasing (last 3 days)
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={filters.macdLineAboveSignal ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(v, 'macdLineAboveSignal');
						}}
					/>
					MACD line above signal line
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={filters.stochasticsKAbvoeD ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(v, 'stochasticsKAbvoeD');
						}}
					/>
					Stochastics K% above D%
				</label>
			</div>
		</div>
	);
};

declare global {
	interface Window {
		TradingView: any;
	}
}
const TradingViewChart = ({ ticker }: { ticker: string }): JSX.Element => {
	const containerId = 'tv_chart_container';

	const createChart = useCallback((): any => {
		if (typeof window.TradingView === 'undefined') {
			return;
		}

		new window.TradingView.widget({
			autosize: true,
			symbol: ticker,
			interval: 'D',
			theme: 'dark',
			style: '1',
			locale: 'en',
			studies: [
				'RSI@tv-basicstudies',
				'MACD@tv-basicstudies', // todo set params for indicators
				'Stochastic@tv-basicstudies'
			],
			container_id: containerId
		});
	}, [ticker]);

	useEffect(() => {
		// remove old chart if it exists
		const oldChart = document.getElementById(containerId);
		if (oldChart) {
			oldChart.innerHTML = '';
		}

		// load script only once
		if (!document.getElementById('tv-script')) {
			const script = document.createElement('script');
			script.id = 'tv-script';
			script.src = 'https://s3.tradingview.com/tv.js';
			script.onload = (): void => {
				return createChart();
			};
			document.body.appendChild(script);
		} else {
			createChart();
		}
	}, [createChart, ticker]);

	return <div id={containerId} style={{ width: '100%', height: '50vh' }} />;
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

	// todo: simplify
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
		if (filters.minWillr && stock.willr < filters.minWillr) {
			return false;
		}
		if (filters.maxWillr && stock.willr > filters.maxWillr) {
			return false;
		}
		if (filters.minStochK && stock.stoch_percent_k < filters.minStochK) {
			return false;
		}
		if (filters.maxStochK && stock.stoch_percent_k > filters.maxStochK) {
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
		if (
			filters.macdLineAboveSignal &&
			stock.macd_line <= stock.signal_line
		) {
			return false;
		}
		if (
			filters.stochasticsKAbvoeD &&
			stock.stoch_percent_k <= stock.stoch_percent_d
		) {
			return false;
		}
		return true;
	});

	// todo: put into cards
	// todo: maybe put chart into server component
	return (
		<>
			<FilterRow filters={filters} setFilters={setFilters}></FilterRow>
			<div className='flex flex-col sm:flex-row gap-4 mt-6 max-h-[80vh]'>
				<div className='sm:basis-1/4 h-[60vh] overflow-auto rounded-xl border p-4 bg-card shadow-sm'>
					<>
						{/* todo: make header sticky  */}
						<h1 className='text-center mt-6 mb-4'>
							Matching Symbols
						</h1>
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
				<div className='sm:basis-3/4 text-center sm:overflow-auto'>
					{selectedStock ? (
						<div className='flex flex-col gap-4'>
							<h1 className='text-xl font-bold tracking-tight sm:text-2xl md:text-4xl'>
								{selectedStock.ticker}
							</h1>
							<TradingViewChart ticker={selectedStock.ticker} />
							<div className='grid grid-cols-2 gap-4'>
								<p>
									Last Updated At:{' '}
									{new Date(
										selectedStock.last_updated_at
									).toDateString()}
								</p>
								<p>
									Implied Volatility:{' '}
									{selectedStock.iv.toPrecision(6)}
								</p>
								<p>
									Signal Date (AMC):{' '}
									{new Date(
										selectedStock.date
									).toDateString()}
								</p>
								<p>
									Williams R%:{' '}
									{selectedStock.willr.toPrecision(6)}
								</p>
							</div>
						</div>
					) : (
						<div className='flex items-center justify-center h-full text-xl'>
							Please select a symbol to see its data
						</div>
					)}
				</div>
			</div>
		</>
	);
}
