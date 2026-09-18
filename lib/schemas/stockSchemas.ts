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

/**
 * An indicator that the scraper may not have been able to compute.
 *
 * Two distinct absent values arrive from the database and both mean the same
 * thing here: a SQL NULL (no value written), and a float NaN - `double
 * precision` happily stores NaN, and the driver hands it back as JS NaN. A
 * symbol with fewer sessions than the indicator's period, or a flat range that
 * divides by zero, produces one or the other. Both normalise to `null` so the
 * UI can render a dash and the filters can skip the row.
 */
const optionalIndicator = z.preprocess((value) => {
	return typeof value === 'number' && Number.isNaN(value) ? null : value;
}, z.number().nullable());

/** A price or volume figure the row is meaningless without. */
const requiredNumber = z.number().refine(
	(value) => {
		return Number.isFinite(value);
	},
	{ message: 'must be a finite number' }
);

export const enrichedStockData = z.object({
	id: z.number(),
	ticker: z.string(),
	index: z.string(),
	date: z.string(),
	close: requiredNumber,
	high: requiredNumber,
	low: requiredNumber,
	open: requiredNumber,
	volume: z.string(),
	last_updated_at: z.string(),
	ema20: optionalIndicator,
	ema50: optionalIndicator,
	macd_line: optionalIndicator,
	signal_line: optionalIndicator,
	rsi_4: optionalIndicator,
	rsi_14: optionalIndicator,
	iv: optionalIndicator,
	willr_4: optionalIndicator,
	willr_14: optionalIndicator,
	stoch_percent_k: optionalIndicator,
	stoch_percent_d: optionalIndicator,
	macd_line_prev_day: optionalIndicator,
	macd_line_prev_prev_day: optionalIndicator,
	adr_7: z.string().nullable(),
	adr_14: z.string().nullable(),
	ma_200: z.string().nullable()
});
export const enrichedStockDataList = z.array(enrichedStockData);

export type EnrichedStockData = z.infer<typeof enrichedStockData>;
export type EnrichedStockDataList = z.infer<typeof enrichedStockDataList>;

/**
 * Parses rows defensively: a row the scraper wrote badly is dropped rather than
 * failing the whole request. `/stock-screener` is prerendered at build time, so
 * one malformed row would otherwise take down the deploy.
 */
export const parseStockRows = (
	rows: unknown[]
): {
	stocks: EnrichedStockDataList;
	rejected: { row: unknown; issue: string }[];
} => {
	const stocks: EnrichedStockDataList = [];
	const rejected: { row: unknown; issue: string }[] = [];

	for (const row of rows) {
		const result = enrichedStockData.safeParse(row);
		if (result.success) {
			stocks.push(result.data);
		} else {
			rejected.push({
				row,
				issue: result.error.issues
					.map((issue) => {
						return `${issue.path.join('.')}: ${issue.message}`;
					})
					.join('; ')
			});
		}
	}

	return { stocks, rejected };
};
