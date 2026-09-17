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
import { fetcher } from '@/lib/utils';
import type { Filter } from '@/lib/db/schema';
import type { EnrichedStockDataList } from '@/lib/schemas/stockSchemas';
import {
	DEFAULT_INDICATOR_LABELS,
	INDICATOR_OPTIONS,
	STORAGE_KEYS,
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
import { formatDate } from '@/lib/screener/format';
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
		<div className='flex flex-col gap-4'>
			<FilterPanel
				allFilters={allFilters ?? []}
				isLoadingAllFilters={isLoadingAllFilters}
				currentFilter={currentFilter}
				setCurrentFilter={setCurrentFilter}
			/>

			<div className='grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,1fr)_2.2fr]'>
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

				<div className='flex min-w-0 flex-col gap-4'>
					{selectedStock === null ? (
						<div className='flex h-[45vh] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground'>
							Select a symbol to see its chart.
						</div>
					) : (
						<>
							<div className='flex flex-wrap items-center justify-between gap-2'>
								<h1 className='text-xl font-bold tracking-tight sm:text-2xl'>
									{selectedStock.ticker}
									<span className='ml-2 text-sm font-normal text-muted-foreground uppercase'>
										{selectedStock.index}
									</span>
								</h1>
								<div className='flex items-center gap-3'>
									<span className='text-xs text-muted-foreground'>
										Data as of {formatDate(lastUpdatedAt)}
									</span>
									<IndicatorSelector
										selected={indicators}
										onChange={setIndicators}
									/>
								</div>
							</div>
							<TradingViewChart
								ticker={selectedStock.ticker}
								indicators={indicators}
								className='h-[45vh] w-full overflow-hidden rounded-xl border'
							/>
							<DataOverview stock={selectedStock} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
