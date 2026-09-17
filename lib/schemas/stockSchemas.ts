import z from 'zod';

/**
 * Shape of a single row returned by the stock analysis database.
 *
 * This lives in its own module (instead of `lib/db/queries.ts`) so that client
 * components can import the type without pulling the `server-only` database
 * module into the browser bundle.
 *
 * Postgres `numeric` columns are transferred as strings by the driver, hence
 * the string typed `adr_7`, `adr_14`, `ma_200` and `volume` fields.
 */
export const enrichedStockData = z.object({
	id: z.number(),
	ticker: z.string(),
	index: z.string(),
	date: z.string(),
	close: z.number(),
	high: z.number(),
	low: z.number(),
	open: z.number(),
	volume: z.string(),
	ema20: z.number(),
	ema50: z.number(),
	macd_line: z.number(),
	signal_line: z.number(),
	rsi_4: z.number(),
	rsi_14: z.number(),
	iv: z.number(),
	willr_4: z.number(),
	willr_14: z.number(),
	last_updated_at: z.string(),
	stoch_percent_k: z.number(),
	stoch_percent_d: z.number(),
	macd_line_prev_day: z.number().nullable(),
	macd_line_prev_prev_day: z.number().nullable(),
	adr_7: z.string().nullable(),
	adr_14: z.string().nullable(),
	ma_200: z.string().nullable()
});
export const enrichedStockDataList = z.array(enrichedStockData);

export type EnrichedStockData = z.infer<typeof enrichedStockData>;
export type EnrichedStockDataList = z.infer<typeof enrichedStockDataList>;
