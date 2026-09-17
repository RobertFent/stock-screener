import type { Filter } from '@/lib/db/schema';
import type { EnrichedStockData } from '@/lib/schemas/stockSchemas';
import { adrPercent, toNumberOrNull } from './format';
import { SUPPORTED_INDEX_KEYS, type SupportedIndexKey } from './constants';

export const NUMERIC_FILTER_KEYS = [
	'minVolume',
	'minClose',
	'maxClose',
	'minAdrPercent7',
	'maxRSI4',
	'maxRSI14',
	'minIV',
	'maxIV',
	'minWillr4',
	'maxWillr4',
	'minWillr14',
	'maxWillr14',
	'minStochK',
	'maxStochK'
] as const;
export type NumericFilterKey = (typeof NUMERIC_FILTER_KEYS)[number];

export const BOOLEAN_FILTER_KEYS = [
	'macdIncreasing',
	'macdLineAboveSignal',
	'closeAboveEma20AboveEma50',
	'closeAboveMA200',
	'stochasticsKAboveD'
] as const;
export type BooleanFilterKey = (typeof BOOLEAN_FILTER_KEYS)[number];

/**
 * The filter as the UI works with it: numbers are real numbers (not the strings
 * an `<input type='number'>` hands back) and booleans are never `null`.
 */
export type ScreenerFilter = {
	id: string | null;
	name: string;
	indices: SupportedIndexKey[];
	createdAt: string | null;
} & Record<NumericFilterKey, number | null> &
	Record<BooleanFilterKey, boolean>;

export const DEFAULT_FILTER_NAME = 'default filter';

/** A filter that matches everything across all supported indices. */
export const createEmptyFilter = (): ScreenerFilter => {
	const numeric = Object.fromEntries(
		NUMERIC_FILTER_KEYS.map((key) => {
			return [key, null];
		})
	) as Record<NumericFilterKey, number | null>;

	const booleans = Object.fromEntries(
		BOOLEAN_FILTER_KEYS.map((key) => {
			return [key, false];
		})
	) as Record<BooleanFilterKey, boolean>;

	return {
		id: null,
		name: DEFAULT_FILTER_NAME,
		indices: [...SUPPORTED_INDEX_KEYS],
		createdAt: null,
		...numeric,
		...booleans
	};
};

const isSupportedIndexKey = (value: string): value is SupportedIndexKey => {
	return (SUPPORTED_INDEX_KEYS as readonly string[]).includes(value);
};

/** Maps a persisted filter row onto the UI representation. */
export const fromDbFilter = (filter: Filter): ScreenerFilter => {
	const base = createEmptyFilter();

	const numeric = Object.fromEntries(
		NUMERIC_FILTER_KEYS.map((key) => {
			return [key, toNumberOrNull(filter[key])];
		})
	) as Record<NumericFilterKey, number | null>;

	const booleans = Object.fromEntries(
		BOOLEAN_FILTER_KEYS.map((key) => {
			return [key, filter[key] ?? false];
		})
	) as Record<BooleanFilterKey, boolean>;

	return {
		...base,
		id: filter.id,
		name: filter.name,
		indices: (filter.indices ?? []).filter(isSupportedIndexKey),
		createdAt: new Date(filter.createdAt).toISOString(),
		...numeric,
		...booleans
	};
};

/** Serialises a filter for the `saveFilter` / `updateFilter` server actions. */
export const toFormData = (filter: ScreenerFilter): FormData => {
	const formData = new FormData();

	formData.set('name', filter.name);
	if (filter.id) {
		formData.set('id', filter.id);
	}

	for (const index of filter.indices) {
		formData.append('indices', index);
	}

	for (const key of NUMERIC_FILTER_KEYS) {
		const value = filter[key];
		if (value !== null && Number.isFinite(value)) {
			formData.set(key, String(value));
		}
	}

	for (const key of BOOLEAN_FILTER_KEYS) {
		if (filter[key]) {
			formData.set(key, 'on');
		}
	}

	return formData;
};

/**
 * Pure predicate deciding whether a single stock passes the given filter.
 *
 * Semantics, deliberately explicit because several of these were inverted
 * before: a `min*` bound rejects values BELOW it, a `max*` bound rejects values
 * ABOVE it. This holds for Williams %R and Stochastic %K too, even though
 * Williams %R is a negative oscillator (-100..0).
 */
export const matchesFilter = (
	stock: EnrichedStockData,
	filter: ScreenerFilter
): boolean => {
	if (
		filter.indices.length > 0 &&
		!filter.indices.includes(stock.index as SupportedIndexKey)
	) {
		return false;
	}

	const volume = toNumberOrNull(stock.volume);
	if (
		filter.minVolume !== null &&
		(volume === null || volume < filter.minVolume)
	) {
		return false;
	}

	if (filter.minClose !== null && stock.close < filter.minClose) {
		return false;
	}
	if (filter.maxClose !== null && stock.close > filter.maxClose) {
		return false;
	}

	if (filter.minAdrPercent7 !== null) {
		const adr = adrPercent(stock.adr_7, stock.close);
		if (adr === null || adr < filter.minAdrPercent7) {
			return false;
		}
	}

	if (filter.maxRSI4 !== null && stock.rsi_4 > filter.maxRSI4) {
		return false;
	}
	if (filter.maxRSI14 !== null && stock.rsi_14 > filter.maxRSI14) {
		return false;
	}

	if (filter.minIV !== null && stock.iv < filter.minIV) {
		return false;
	}
	if (filter.maxIV !== null && stock.iv > filter.maxIV) {
		return false;
	}

	if (filter.minWillr4 !== null && stock.willr_4 < filter.minWillr4) {
		return false;
	}
	if (filter.maxWillr4 !== null && stock.willr_4 > filter.maxWillr4) {
		return false;
	}

	if (filter.minWillr14 !== null && stock.willr_14 < filter.minWillr14) {
		return false;
	}
	if (filter.maxWillr14 !== null && stock.willr_14 > filter.maxWillr14) {
		return false;
	}

	if (filter.minStochK !== null && stock.stoch_percent_k < filter.minStochK) {
		return false;
	}
	if (filter.maxStochK !== null && stock.stoch_percent_k > filter.maxStochK) {
		return false;
	}

	if (filter.macdIncreasing) {
		const { macd_line, macd_line_prev_day, macd_line_prev_prev_day } =
			stock;
		if (macd_line_prev_day === null || macd_line_prev_prev_day === null) {
			return false;
		}
		if (
			macd_line < macd_line_prev_day ||
			macd_line_prev_day < macd_line_prev_prev_day
		) {
			return false;
		}
	}

	if (filter.macdLineAboveSignal && stock.macd_line <= stock.signal_line) {
		return false;
	}

	if (
		filter.closeAboveEma20AboveEma50 &&
		(stock.close < stock.ema20 || stock.ema20 < stock.ema50)
	) {
		return false;
	}

	if (filter.closeAboveMA200) {
		const ma200 = toNumberOrNull(stock.ma_200);
		// a stock without a 200 day average cannot satisfy the condition
		if (ma200 === null || stock.close < ma200) {
			return false;
		}
	}

	if (
		filter.stochasticsKAboveD &&
		stock.stoch_percent_k <= stock.stoch_percent_d
	) {
		return false;
	}

	return true;
};

export const applyFilter = (
	stocks: readonly EnrichedStockData[],
	filter: ScreenerFilter
): EnrichedStockData[] => {
	return stocks.filter((stock) => {
		return matchesFilter(stock, filter);
	});
};

/** Number of bounds/toggles the user has actually set. Drives the UI badge. */
export const countActiveCriteria = (filter: ScreenerFilter): number => {
	const numericCount = NUMERIC_FILTER_KEYS.filter((key) => {
		return filter[key] !== null;
	}).length;
	const booleanCount = BOOLEAN_FILTER_KEYS.filter((key) => {
		return filter[key];
	}).length;
	const indexCount =
		filter.indices.length > 0 &&
		filter.indices.length < SUPPORTED_INDEX_KEYS.length
			? 1
			: 0;

	return numericCount + booleanCount + indexCount;
};
