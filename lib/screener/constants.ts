/** A TradingView study (indicator) that can be overlaid on the chart. */
export type Study = { id: string; label: string; inputs?: { length: number } };

/** Maximum number of studies TradingView renders comfortably on one chart. */
export const MAX_SELECTED_INDICATORS = 3;

export const INDICATOR_OPTIONS: readonly Study[] = [
	{ id: 'RSI@tv-basicstudies', label: 'RSI(14)', inputs: { length: 14 } },
	{ id: 'RSI@tv-basicstudies', label: 'RSI(4)', inputs: { length: 4 } },
	{ id: 'MACD@tv-basicstudies', label: 'MACD(12, 26, 9)' },
	// Williams %R is not supported by the free TradingView widget
	{ id: 'Stochastic@tv-basicstudies', label: 'Stoch(14, 3, 3)' },
	{
		id: 'MASimple@tv-basicstudies',
		label: 'MA(200)',
		inputs: { length: 200 }
	},
	{ id: 'MAExp@tv-basicstudies', label: 'EMA(20)', inputs: { length: 20 } },
	{ id: 'MAExp@tv-basicstudies', label: 'EMA(50)', inputs: { length: 50 } }
];

export const DEFAULT_INDICATOR_LABELS: readonly string[] = [
	'RSI(14)',
	'MACD(12, 26, 9)',
	'Stoch(14, 3, 3)'
];

export const SUPPORTED_INDEX_KEYS = ['sp100', 'sp500', 'nasdaq100'] as const;
export type SupportedIndexKey = (typeof SUPPORTED_INDEX_KEYS)[number];

export const SUPPORTED_INDICES: readonly {
	key: SupportedIndexKey;
	value: string;
}[] = [
	{ key: 'sp100', value: 'S&P 100' },
	{ key: 'sp500', value: 'S&P 500' },
	{ key: 'nasdaq100', value: 'Nasdaq 100' }
];

/** localStorage keys used by the screener. */
export const STORAGE_KEYS = {
	indicators: 'screener:indicators'
} as const;
