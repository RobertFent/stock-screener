import {
	applyFilter,
	countActiveCriteria,
	createEmptyFilter,
	fromDbFilter,
	matchesFilter,
	toFormData
} from './filter';
import { buildStock } from './testFactories';
import type { Filter } from '@/lib/db/schema';

describe('createEmptyFilter', () => {
	it('matches every index and sets no bounds', () => {
		const filter = createEmptyFilter();
		expect(filter.indices).toEqual(['sp100', 'sp500', 'nasdaq100']);
		expect(filter.maxRSI4).toBeNull();
		expect(filter.macdIncreasing).toBe(false);
	});
});

describe('matchesFilter', () => {
	it('keeps a stock when nothing is constrained', () => {
		expect(matchesFilter(buildStock(), createEmptyFilter())).toBe(true);
	});

	it('filters by index', () => {
		const filter = { ...createEmptyFilter(), indices: ['sp500' as const] };
		expect(matchesFilter(buildStock({ index: 'sp100' }), filter)).toBe(
			false
		);
		expect(matchesFilter(buildStock({ index: 'sp500' }), filter)).toBe(
			true
		);
	});

	it('applies the volume floor against the bigint string', () => {
		const filter = { ...createEmptyFilter(), minVolume: 6_000_000 };
		expect(matchesFilter(buildStock({ volume: '5000000' }), filter)).toBe(
			false
		);
		expect(matchesFilter(buildStock({ volume: '7000000' }), filter)).toBe(
			true
		);
	});

	it('applies the price band', () => {
		const filter = {
			...createEmptyFilter(),
			minClose: 50,
			maxClose: 150
		};
		expect(matchesFilter(buildStock({ close: 40 }), filter)).toBe(false);
		expect(matchesFilter(buildStock({ close: 100 }), filter)).toBe(true);
		expect(matchesFilter(buildStock({ close: 200 }), filter)).toBe(false);
	});

	it('applies the ADR% floor and rejects rows without an ADR', () => {
		const filter = { ...createEmptyFilter(), minAdrPercent7: 3 };
		// 3.5 / 100 = 3.5%
		expect(matchesFilter(buildStock({ adr_7: '3.5' }), filter)).toBe(true);
		expect(matchesFilter(buildStock({ adr_7: '2' }), filter)).toBe(false);
		expect(matchesFilter(buildStock({ adr_7: null }), filter)).toBe(false);
	});

	it('treats max RSI as an upper bound', () => {
		const filter = { ...createEmptyFilter(), maxRSI4: 30 };
		expect(matchesFilter(buildStock({ rsi_4: 25 }), filter)).toBe(true);
		expect(matchesFilter(buildStock({ rsi_4: 35 }), filter)).toBe(false);
	});

	// this was inverted before: min rejected values ABOVE the bound
	it.each([
		['minWillr4', 'willr_4'],
		['minWillr14', 'willr_14'],
		['minStochK', 'stoch_percent_k']
	] as const)('treats %s as a lower bound', (filterKey, stockKey) => {
		const filter = { ...createEmptyFilter(), [filterKey]: -80 };
		expect(matchesFilter(buildStock({ [stockKey]: -90 }), filter)).toBe(
			false
		);
		expect(matchesFilter(buildStock({ [stockKey]: -70 }), filter)).toBe(
			true
		);
	});

	it.each([
		['maxWillr4', 'willr_4'],
		['maxWillr14', 'willr_14'],
		['maxStochK', 'stoch_percent_k']
	] as const)('treats %s as an upper bound', (filterKey, stockKey) => {
		const filter = { ...createEmptyFilter(), [filterKey]: -20 };
		expect(matchesFilter(buildStock({ [stockKey]: -10 }), filter)).toBe(
			false
		);
		expect(matchesFilter(buildStock({ [stockKey]: -30 }), filter)).toBe(
			true
		);
	});

	it('keeps only rising MACD histories and rejects incomplete ones', () => {
		const filter = { ...createEmptyFilter(), macdIncreasing: true };
		expect(
			matchesFilter(
				buildStock({
					macd_line: 3,
					macd_line_prev_day: 2,
					macd_line_prev_prev_day: 1
				}),
				filter
			)
		).toBe(true);
		expect(
			matchesFilter(
				buildStock({
					macd_line: 1,
					macd_line_prev_day: 2,
					macd_line_prev_prev_day: 1
				}),
				filter
			)
		).toBe(false);
		expect(
			matchesFilter(buildStock({ macd_line_prev_prev_day: null }), filter)
		).toBe(false);
	});

	it('rejects stocks without a 200 day average when close > MA200 is required', () => {
		const filter = { ...createEmptyFilter(), closeAboveMA200: true };
		expect(
			matchesFilter(buildStock({ close: 100, ma_200: '80' }), filter)
		).toBe(true);
		expect(
			matchesFilter(buildStock({ close: 100, ma_200: '120' }), filter)
		).toBe(false);
		// previously `100 < Number(null)` was false, so these slipped through
		expect(
			matchesFilter(buildStock({ close: 100, ma_200: null }), filter)
		).toBe(false);
	});

	it('requires the MACD line strictly above the signal line', () => {
		const filter = { ...createEmptyFilter(), macdLineAboveSignal: true };
		expect(
			matchesFilter(buildStock({ macd_line: 1, signal_line: 1 }), filter)
		).toBe(false);
		expect(
			matchesFilter(
				buildStock({ macd_line: 1.1, signal_line: 1 }),
				filter
			)
		).toBe(true);
	});

	it('requires close > EMA20 > EMA50', () => {
		const filter = {
			...createEmptyFilter(),
			closeAboveEma20AboveEma50: true
		};
		expect(
			matchesFilter(
				buildStock({ close: 100, ema20: 95, ema50: 90 }),
				filter
			)
		).toBe(true);
		expect(
			matchesFilter(
				buildStock({ close: 100, ema20: 85, ema50: 90 }),
				filter
			)
		).toBe(false);
	});
});

describe('applyFilter', () => {
	it('returns only matching stocks', () => {
		const stocks = [
			buildStock({ id: 1, ticker: 'AAA', rsi_4: 10 }),
			buildStock({ id: 2, ticker: 'BBB', rsi_4: 90 })
		];
		const result = applyFilter(stocks, {
			...createEmptyFilter(),
			maxRSI4: 50
		});
		expect(
			result.map((stock) => {
				return stock.ticker;
			})
		).toEqual(['AAA']);
	});
});

describe('countActiveCriteria', () => {
	it('counts bounds, switches and a narrowed index selection', () => {
		expect(countActiveCriteria(createEmptyFilter())).toBe(0);
		expect(
			countActiveCriteria({
				...createEmptyFilter(),
				maxRSI4: 30,
				closeAboveMA200: true,
				indices: ['sp100']
			})
		).toBe(3);
	});
});

describe('toFormData', () => {
	it('omits empty bounds and unchecked switches', () => {
		const formData = toFormData({
			...createEmptyFilter(),
			name: 'my filter',
			maxRSI4: 30,
			closeAboveMA200: true
		});

		expect(formData.get('name')).toBe('my filter');
		expect(formData.get('maxRSI4')).toBe('30');
		expect(formData.get('closeAboveMA200')).toBe('on');
		expect(formData.get('maxRSI14')).toBeNull();
		expect(formData.get('macdIncreasing')).toBeNull();
		expect(formData.getAll('indices')).toEqual([
			'sp100',
			'sp500',
			'nasdaq100'
		]);
	});

	it('sends the id only when an existing preset is edited', () => {
		expect(toFormData(createEmptyFilter()).get('id')).toBeNull();
		expect(
			toFormData({ ...createEmptyFilter(), id: 'abc' }).get('id')
		).toBe('abc');
	});
});

describe('fromDbFilter', () => {
	it('normalises nulls and unknown indices', () => {
		const dbFilter = {
			id: 'abc',
			name: 'saved',
			indices: ['sp100', 'dax' as unknown as 'sp500'],
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			minVolume: 1000,
			minClose: null,
			maxClose: null,
			minAdrPercent7: null,
			maxRSI4: 30,
			maxRSI14: null,
			minIV: null,
			maxIV: null,
			minWillr4: null,
			maxWillr4: null,
			minWillr14: null,
			maxWillr14: null,
			minStochK: null,
			maxStochK: null,
			macdIncreasing: null,
			macdLineAboveSignal: true,
			closeAboveEma20AboveEma50: null,
			closeAboveMA200: null,
			stochasticsKAboveD: null
		} as unknown as Filter;

		const filter = fromDbFilter(dbFilter);

		expect(filter.indices).toEqual(['sp100']);
		expect(filter.minVolume).toBe(1000);
		expect(filter.maxRSI4).toBe(30);
		expect(filter.macdIncreasing).toBe(false);
		expect(filter.macdLineAboveSignal).toBe(true);
	});
});
