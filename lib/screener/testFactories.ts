import type { EnrichedStockData } from '@/lib/schemas/stockSchemas';

/** Builds a fully populated stock row; override only what a test cares about. */
export const buildStock = (
	overrides: Partial<EnrichedStockData> = {}
): EnrichedStockData => {
	return {
		id: 1,
		ticker: 'AAPL',
		index: 'sp100',
		date: '2026-09-16',
		close: 100,
		high: 102,
		low: 98,
		open: 99,
		volume: '5000000',
		ema20: 95,
		ema50: 90,
		macd_line: 1.5,
		signal_line: 1,
		rsi_4: 40,
		rsi_14: 45,
		iv: 30,
		willr_4: -50,
		willr_14: -60,
		last_updated_at: '2026-09-17T06:15:00.000Z',
		stoch_percent_k: 55,
		stoch_percent_d: 50,
		macd_line_prev_day: 1.2,
		macd_line_prev_prev_day: 1,
		adr_7: '3.5',
		adr_14: '3.2',
		ma_200: '80',
		...overrides
	};
};
