'use client';

import {
	JSX,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import useSWR from 'swr';
import { ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/utils';
import type { Filter } from '@/lib/db/schema';
import type {
	EnrichedStockData,
	EnrichedStockDataList
} from '@/lib/schemas/stockSchemas';
import {
	DEFAULT_INDICATOR_LABELS,
	INDICATOR_OPTIONS,
	STORAGE_KEYS,
	SUPPORTED_INDICES,
	type Study
} from '@/lib/screener/constants';
import {
	applyFilter,
	createEmptyFilter,
	fromDbFilter,
	type ScreenerFilter
} from '@/lib/screener/filter';
import { DEFAULT_SORT, sortStocks, type SortState } from '@/lib/screener/sort';
import {
	fromSearchParams,
	hasScreenerParams,
	toSearchParams
} from '@/lib/screener/url';
import {
	adrPercent,
	formatCurrency,
	formatDate,
	formatNumber,
	formatPercent
} from '@/lib/screener/format';
import { FilterPanel } from './components/filter-panel';
import { ResultsTable } from './components/results-table';
import { TradingViewChart } from './components/trading-view-chart';
import { IndicatorSelector } from './components/indicator-selector';
import { DataOverview } from './components/data-overview';

const readStoredIndicators = (): Study[] => {
	const fallback = INDICATOR_OPTIONS.filter((option) => {
		return DEFAULT_INDICATOR_LABELS.includes(option.label);
	});

	if (typeof window === 'undefined') {
		return fallback;
	}

	try {
		const saved = window.localStorage.getItem(STORAGE_KEYS.indicators);
		if (!saved) {
			return fallback;
		}
		const parsed: unknown = JSON.parse(saved);
		if (!Array.isArray(parsed)) {
			return fallback;
		}
		// only keep labels the app still knows about
		const restored = parsed.flatMap((entry) => {
			const label = (entry as Study)?.label;
			const option = INDICATOR_OPTIONS.find((candidate) => {
				return candidate.label === label;
			});
			return option ? [option] : [];
		});
		return restored.length > 0 ? restored : fallback;
	} catch {
		return fallback;
	}
};

const indexLabel = (key: string): string => {
	return (
		SUPPORTED_INDICES.find((index) => {
			return index.key === key;
		})?.value ?? key
	);
};

/** Compact price strip above the chart, so the key numbers are always visible. */
const SymbolHeader = ({
	stock,
	lastUpdatedAt,
	indicators,
	onIndicatorsChange
}: {
	stock: EnrichedStockData;
	lastUpdatedAt: string | null;
	indicators: Study[];
	onIndicatorsChange: (indicators: Study[]) => void;
}): JSX.Element => {
	const adr = adrPercent(stock.adr_7, stock.close);

	return (
		<header className='border-hairline bg-card shadow-elevation-1 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border px-3 py-2.5'>
			<div className='flex items-baseline gap-2'>
				<h1 className='text-xl font-semibold tracking-tight'>
					{stock.ticker}
				</h1>
				<Badge variant='neutral' size='sm'>
					{indexLabel(stock.index)}
				</Badge>
			</div>

			<dl className='flex flex-wrap items-baseline gap-x-5 gap-y-1'>
				{[
					{ label: 'Close', value: formatCurrency(stock.close) },
					{
						label: 'ADR%',
						value: adr === null ? '—' : formatPercent(adr, 1)
					},
					{ label: 'IV', value: formatNumber(stock.iv, 1) },
					{ label: 'RSI 4', value: formatNumber(stock.rsi_4, 1) }
				].map((item) => {
					return (
						<div
							key={item.label}
							className='flex items-baseline gap-1.5'
						>
							<dt className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
								{item.label}
							</dt>
							<dd className='text-sm font-medium tabular'>
								{item.value}
							</dd>
						</div>
					);
				})}
			</dl>

			<div className='ml-auto flex items-center gap-2'>
				<span className='text-muted-foreground hidden text-[11px] xl:inline'>
					Data as of {formatDate(lastUpdatedAt)}
				</span>
				<IndicatorSelector
					selected={indicators}
					onChange={onIndicatorsChange}
				/>
				<Button asChild variant='ghost' size='icon-sm'>
					<a
						href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(stock.ticker)}`}
						target='_blank'
						rel='noreferrer'
						title={`Open ${stock.ticker} on TradingView`}
						aria-label={`Open ${stock.ticker} on TradingView`}
					>
						<ExternalLink />
					</a>
				</Button>
			</div>
		</header>
	);
};

export default function StockDataView({
	stocks
}: {
	stocks: EnrichedStockDataList;
}): JSX.Element {
	const { data: allFilters, isLoading: isLoadingAllFilters } = useSWR<
		Filter[]
	>('/api/filters', fetcher);

	const [currentFilter, setCurrentFilter] =
		useState<ScreenerFilter>(createEmptyFilter);
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
	const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
	const [indicators, setIndicators] = useState<Study[]>([]);

	const initialStateApplied = useRef(false);

	// restore indicators and any shared screener URL after hydration, so server
	// and client render the same markup on the first pass
	useEffect(() => {
		/* eslint-disable react-hooks/set-state-in-effect */
		setIndicators(readStoredIndicators());

		const params = new URLSearchParams(window.location.search);
		if (hasScreenerParams(params)) {
			const restored = fromSearchParams(params);
			setCurrentFilter(restored.filter);
			setSearch(restored.search);
			setSort(restored.sort);
			setSelectedTicker(restored.symbol);
			initialStateApplied.current = true;
		}
		/* eslint-enable react-hooks/set-state-in-effect */
	}, []);

	// otherwise fall back to the team's default preset once it arrives
	useEffect(() => {
		if (initialStateApplied.current || !allFilters?.length) {
			return;
		}
		const defaultFilter =
			allFilters.find((filter) => {
				return filter.isDefault;
			}) ?? allFilters[0];
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setCurrentFilter(fromDbFilter(defaultFilter));
		initialStateApplied.current = true;
	}, [allFilters]);

	useEffect(() => {
		if (indicators.length === 0) {
			return;
		}
		try {
			window.localStorage.setItem(
				STORAGE_KEYS.indicators,
				JSON.stringify(indicators)
			);
		} catch {
			// storage can be unavailable (private mode, quota); not critical
		}
	}, [indicators]);

	// keep typing in the filter inputs responsive even with a few thousand rows
	const deferredFilter = useDeferredValue(currentFilter);
	const deferredSearch = useDeferredValue(search);

	const matchingStocks = useMemo(() => {
		return applyFilter(stocks, deferredFilter);
	}, [stocks, deferredFilter]);

	const visibleStocks = useMemo(() => {
		const term = deferredSearch.trim().toUpperCase();
		const searched =
			term === ''
				? matchingStocks
				: matchingStocks.filter((stock) => {
						return stock.ticker.toUpperCase().includes(term);
					});
		return sortStocks(searched, sort);
	}, [matchingStocks, deferredSearch, sort]);

	// derived, never stored: the selection survives filter changes when it still
	// matches and otherwise falls back to the first row
	const selectedStock =
		visibleStocks.find((stock) => {
			return stock.ticker === selectedTicker;
		}) ??
		visibleStocks[0] ??
		null;

	// mirror the current view into the URL so a screen can be shared
	useEffect(() => {
		const timeout = setTimeout(() => {
			const params = toSearchParams({
				filter: currentFilter,
				search,
				sort,
				symbol: selectedStock?.ticker ?? null
			});
			const query = params.toString();
			window.history.replaceState(
				null,
				'',
				query === ''
					? window.location.pathname
					: `${window.location.pathname}?${query}`
			);
		}, 300);

		return (): void => {
			clearTimeout(timeout);
		};
	}, [currentFilter, search, sort, selectedStock?.ticker]);

	const lastUpdatedAt = stocks[0]?.last_updated_at ?? null;

	return (
		<div className='flex flex-col gap-3 lg:h-[calc(100dvh-5.5rem)]'>
			<FilterPanel
				allFilters={allFilters ?? []}
				isLoadingAllFilters={isLoadingAllFilters}
				currentFilter={currentFilter}
				setCurrentFilter={setCurrentFilter}
			/>

			<div className='grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(300px,24%)_1fr]'>
				<div className='flex max-h-[55vh] min-h-0 flex-col lg:max-h-none'>
					<ResultsTable
						stocks={visibleStocks}
						totalCount={stocks.length}
						selectedTicker={selectedStock?.ticker ?? null}
						onSelect={(stock) => {
							setSelectedTicker(stock.ticker);
						}}
						sort={sort}
						onSortChange={setSort}
						search={search}
						onSearchChange={setSearch}
					/>
				</div>

				{/* scrolls internally when the viewport is too short for the
				chart plus the metric grid, instead of clipping them */}
				<div className='scrollbar-slim flex min-h-0 min-w-0 flex-col gap-3 lg:overflow-y-auto'>
					{selectedStock === null ? (
						<div className='border-hairline bg-card text-muted-foreground flex min-h-[320px] flex-1 items-center justify-center rounded-xl border text-sm'>
							Select a symbol to see its chart.
						</div>
					) : (
						<>
							<SymbolHeader
								stock={selectedStock}
								lastUpdatedAt={lastUpdatedAt}
								indicators={indicators}
								onIndicatorsChange={setIndicators}
							/>
							<TradingViewChart
								ticker={selectedStock.ticker}
								indicators={indicators}
								className='border-hairline bg-card shadow-elevation-1 min-h-[300px] flex-1 shrink-0 overflow-hidden rounded-xl border'
							/>
							<DataOverview stock={selectedStock} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
