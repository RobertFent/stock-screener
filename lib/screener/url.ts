import {
	BOOLEAN_FILTER_KEYS,
	NUMERIC_FILTER_KEYS,
	createEmptyFilter,
	type ScreenerFilter
} from './filter';
import { SUPPORTED_INDEX_KEYS, type SupportedIndexKey } from './constants';
import { DEFAULT_SORT, isSortKey, type SortState } from './sort';

export type ScreenerUrlState = {
	filter: ScreenerFilter;
	search: string;
	sort: SortState;
	symbol: string | null;
};

const INDICES_PARAM = 'idx';
const SEARCH_PARAM = 'q';
const SORT_PARAM = 'sort';
const SYMBOL_PARAM = 'symbol';
const PRESET_PARAM = 'preset';

/**
 * Serialises the whole screener view into query params so a screen can be
 * bookmarked or shared with someone else. Defaults are omitted to keep the URL
 * short.
 */
export const toSearchParams = (state: ScreenerUrlState): URLSearchParams => {
	const params = new URLSearchParams();

	if (state.filter.id) {
		params.set(PRESET_PARAM, state.filter.id);
	}

	if (
		state.filter.indices.length > 0 &&
		state.filter.indices.length < SUPPORTED_INDEX_KEYS.length
	) {
		params.set(INDICES_PARAM, state.filter.indices.join(','));
	}

	for (const key of NUMERIC_FILTER_KEYS) {
		const value = state.filter[key];
		if (value !== null && Number.isFinite(value)) {
			params.set(key, String(value));
		}
	}

	for (const key of BOOLEAN_FILTER_KEYS) {
		if (state.filter[key]) {
			params.set(key, '1');
		}
	}

	if (state.search.trim() !== '') {
		params.set(SEARCH_PARAM, state.search.trim());
	}

	if (
		state.sort.key !== DEFAULT_SORT.key ||
		state.sort.direction !== DEFAULT_SORT.direction
	) {
		params.set(SORT_PARAM, `${state.sort.key}:${state.sort.direction}`);
	}

	if (state.symbol) {
		params.set(SYMBOL_PARAM, state.symbol);
	}

	return params;
};

const parseSort = (raw: string | null): SortState => {
	if (!raw) {
		return DEFAULT_SORT;
	}
	const [key, direction] = raw.split(':');
	if (!isSortKey(key)) {
		return DEFAULT_SORT;
	}
	return {
		key,
		direction: direction === 'asc' ? 'asc' : 'desc'
	};
};

const parseNumber = (raw: string | null): number | null => {
	if (raw === null || raw.trim() === '') {
		return null;
	}
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : null;
};

/** Inverse of {@link toSearchParams}; unknown or malformed params are ignored. */
export const fromSearchParams = (params: URLSearchParams): ScreenerUrlState => {
	const filter = createEmptyFilter();

	const preset = params.get(PRESET_PARAM);
	if (preset) {
		filter.id = preset;
	}

	const indices = params.get(INDICES_PARAM);
	if (indices !== null) {
		const parsed = indices
			.split(',')
			.map((value) => {
				return value.trim();
			})
			.filter((value): value is SupportedIndexKey => {
				return (SUPPORTED_INDEX_KEYS as readonly string[]).includes(
					value
				);
			});
		if (parsed.length > 0) {
			filter.indices = parsed;
		}
	}

	for (const key of NUMERIC_FILTER_KEYS) {
		filter[key] = parseNumber(params.get(key));
	}

	for (const key of BOOLEAN_FILTER_KEYS) {
		filter[key] = params.get(key) === '1';
	}

	return {
		filter,
		search: params.get(SEARCH_PARAM) ?? '',
		sort: parseSort(params.get(SORT_PARAM)),
		symbol: params.get(SYMBOL_PARAM)
	};
};

/** True when the URL carries any screener state worth restoring. */
export const hasScreenerParams = (params: URLSearchParams): boolean => {
	const known = [
		PRESET_PARAM,
		INDICES_PARAM,
		SEARCH_PARAM,
		SORT_PARAM,
		SYMBOL_PARAM,
		...NUMERIC_FILTER_KEYS,
		...BOOLEAN_FILTER_KEYS
	];
	return known.some((key) => {
		return params.has(key);
	});
};
