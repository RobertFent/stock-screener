import { evaluateConditions } from './conditions';
import { buildStock } from './testFactories';

const stateOf = (
	stock: Parameters<typeof evaluateConditions>[0],
	label: string
): boolean | null => {
	const condition = evaluateConditions(stock).find((entry) => {
		return entry.label === label;
	});
	if (!condition) {
		throw new Error(`unknown condition: ${label}`);
	}
	return condition.state;
};

describe('evaluateConditions', () => {
	it('evaluates the conditions when every input is present', () => {
		const stock = buildStock({
			close: 100,
			ema20: 95,
			ema50: 90,
			ma_200: '80',
			macd_line: 2,
			signal_line: 1,
			macd_line_prev_day: 1.5,
			macd_line_prev_prev_day: 1,
			stoch_percent_k: 60,
			stoch_percent_d: 50
		});

		expect(stateOf(stock, 'Close > MA200')).toBe(true);
		expect(stateOf(stock, 'Close > EMA20 > EMA50')).toBe(true);
		expect(stateOf(stock, 'MACD > signal')).toBe(true);
		expect(stateOf(stock, 'MACD rising')).toBe(true);
		expect(stateOf(stock, '%K > %D')).toBe(true);
	});

	it('reports unknown rather than false when an input is missing', () => {
		const stock = buildStock({
			ema20: null,
			ma_200: null,
			signal_line: null,
			macd_line_prev_prev_day: null,
			stoch_percent_d: null
		});

		expect(stateOf(stock, 'Close > MA200')).toBeNull();
		expect(stateOf(stock, 'Close > EMA20 > EMA50')).toBeNull();
		expect(stateOf(stock, 'MACD > signal')).toBeNull();
		expect(stateOf(stock, 'MACD rising')).toBeNull();
		expect(stateOf(stock, '%K > %D')).toBeNull();
	});
});
