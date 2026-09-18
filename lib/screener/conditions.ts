import type { EnrichedStockData } from '@/lib/schemas/stockSchemas';
import { toNumberOrNull } from './format';

/** `null` means the inputs are missing, so the condition cannot be evaluated. */
export type ConditionState = boolean | null;

export type Condition = { label: string; state: ConditionState };

/** Evaluates a two input condition, yielding `null` when either is missing. */
const compare = (
	left: number | null,
	right: number | null,
	predicate: (left: number, right: number) => boolean
): ConditionState => {
	if (left === null || right === null) {
		return null;
	}
	return predicate(left, right);
};

/**
 * The boolean conditions the screener can filter on, evaluated for one symbol.
 * Mirrors the switches in the filter panel, so the chips and the filter always
 * agree about what a missing indicator means.
 */
export const evaluateConditions = (stock: EnrichedStockData): Condition[] => {
	const { ema20, ema50, macd_line, signal_line } = stock;
	const previous = stock.macd_line_prev_day;
	const beforePrevious = stock.macd_line_prev_prev_day;

	const trendState =
		ema20 === null || ema50 === null
			? null
			: stock.close >= ema20 && ema20 >= ema50;

	const macdRisingState =
		macd_line === null || previous === null || beforePrevious === null
			? null
			: macd_line >= previous && previous >= beforePrevious;

	return [
		{
			label: 'Close > MA200',
			state: compare(
				stock.close,
				toNumberOrNull(stock.ma_200),
				(close, ma200) => {
					return close >= ma200;
				}
			)
		},
		{ label: 'Close > EMA20 > EMA50', state: trendState },
		{
			label: 'MACD > signal',
			state: compare(macd_line, signal_line, (line, signal) => {
				return line > signal;
			})
		},
		{ label: 'MACD rising', state: macdRisingState },
		{
			label: '%K > %D',
			state: compare(
				stock.stoch_percent_k,
				stock.stoch_percent_d,
				(k, d) => {
					return k > d;
				}
			)
		}
	];
};
