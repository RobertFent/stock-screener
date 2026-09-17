import type { EnrichedStockData } from '@/lib/schemas/stockSchemas';
import { adrPercent, toNumberOrNull } from './format';

export type SortDirection = 'asc' | 'desc';

export const SORT_KEYS = [
	'ticker',
	'close',
	'adrPercent',
	'iv',
	'rsi_4',
	'rsi_14',
	'willr_4',
	'willr_14',
	'stoch_percent_k',
	'volume'
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type SortState = { key: SortKey; direction: SortDirection };

export const DEFAULT_SORT: SortState = { key: 'ticker', direction: 'asc' };

export const isSortKey = (value: string): value is SortKey => {
	return (SORT_KEYS as readonly string[]).includes(value);
};

/** Column metadata shared by the results table header and the sort control. */
export const SORTABLE_COLUMNS: readonly {
	key: SortKey;
	label: string;
	title: string;
	numeric: boolean;
}[] = [
	{ key: 'ticker', label: 'Symbol', title: 'Ticker symbol', numeric: false },
	{ key: 'close', label: 'Close', title: 'Last close price', numeric: true },
	{
		key: 'adrPercent',
		label: 'ADR%',
		title: 'Average daily range (7) as % of close',
		numeric: true
	},
	{ key: 'iv', label: 'IV', title: 'Implied volatility (30)', numeric: true },
	{ key: 'rsi_4', label: 'RSI4', title: 'RSI(4)', numeric: true },
	{ key: 'rsi_14', label: 'RSI14', title: 'RSI(14)', numeric: true },
	{ key: 'willr_4', label: '%R4', title: 'Williams %R(4)', numeric: true },
	{ key: 'willr_14', label: '%R14', title: 'Williams %R(14)', numeric: true },
	{
		key: 'stoch_percent_k',
		label: '%K',
		title: 'Stochastic slow %K(14, 3, 3)',
		numeric: true
	},
	{ key: 'volume', label: 'Vol', title: 'Volume', numeric: true }
];

const sortValue = (
	stock: EnrichedStockData,
	key: SortKey
): number | string | null => {
	switch (key) {
		case 'ticker':
			return stock.ticker;
		case 'adrPercent':
			return adrPercent(stock.adr_7, stock.close);
		case 'volume':
			return toNumberOrNull(stock.volume);
		default:
			return stock[key];
	}
};

/**
 * Stable sort; rows without a value for the sort key always sink to the bottom
 * regardless of direction, so an empty column never hides good candidates.
 */
export const sortStocks = (
	stocks: readonly EnrichedStockData[],
	sort: SortState
): EnrichedStockData[] => {
	const factor = sort.direction === 'asc' ? 1 : -1;

	return [...stocks].sort((a, b) => {
		const left = sortValue(a, sort.key);
		const right = sortValue(b, sort.key);

		if (left === null && right === null) {
			return a.ticker.localeCompare(b.ticker);
		}
		if (left === null) {
			return 1;
		}
		if (right === null) {
			return -1;
		}

		if (typeof left === 'string' || typeof right === 'string') {
			return String(left).localeCompare(String(right)) * factor;
		}

		if (left === right) {
			return a.ticker.localeCompare(b.ticker);
		}

		return (left < right ? -1 : 1) * factor;
	});
};

/** Clicking a column toggles direction; a new column starts descending
 * for numeric metrics and ascending for the symbol. */
export const nextSortState = (current: SortState, key: SortKey): SortState => {
	if (current.key === key) {
		return {
			key,
			direction: current.direction === 'asc' ? 'desc' : 'asc'
		};
	}
	return { key, direction: key === 'ticker' ? 'asc' : 'desc' };
};
