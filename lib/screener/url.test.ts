import { createEmptyFilter } from './filter';
import { DEFAULT_SORT } from './sort';
import { fromSearchParams, hasScreenerParams, toSearchParams } from './url';

describe('screener url state', () => {
	it('omits defaults so a pristine view has a clean url', () => {
		const params = toSearchParams({
			filter: createEmptyFilter(),
			search: '',
			sort: DEFAULT_SORT,
			symbol: null
		});
		expect(params.toString()).toBe('');
	});

	it('round trips a configured view', () => {
		const filter = {
			...createEmptyFilter(),
			id: 'preset-1',
			indices: ['sp100' as const],
			maxRSI4: 30,
			minAdrPercent7: 3.5,
			closeAboveMA200: true
		};

		const restored = fromSearchParams(
			toSearchParams({
				filter,
				search: 'aa',
				sort: { key: 'close', direction: 'asc' },
				symbol: 'AAPL'
			})
		);

		expect(restored.filter.id).toBe('preset-1');
		expect(restored.filter.indices).toEqual(['sp100']);
		expect(restored.filter.maxRSI4).toBe(30);
		expect(restored.filter.minAdrPercent7).toBe(3.5);
		expect(restored.filter.closeAboveMA200).toBe(true);
		expect(restored.filter.macdIncreasing).toBe(false);
		expect(restored.search).toBe('aa');
		expect(restored.sort).toEqual({ key: 'close', direction: 'asc' });
		expect(restored.symbol).toBe('AAPL');
	});

	it('ignores malformed values', () => {
		const restored = fromSearchParams(
			new URLSearchParams(
				'maxRSI4=abc&idx=dax&sort=nonsense&closeAboveMA200=maybe'
			)
		);
		expect(restored.filter.maxRSI4).toBeNull();
		expect(restored.filter.indices).toEqual([
			'sp100',
			'sp500',
			'nasdaq100'
		]);
		expect(restored.sort).toEqual(DEFAULT_SORT);
		expect(restored.filter.closeAboveMA200).toBe(false);
	});

	it('detects whether a url carries screener state', () => {
		expect(hasScreenerParams(new URLSearchParams(''))).toBe(false);
		expect(hasScreenerParams(new URLSearchParams('utm=x'))).toBe(false);
		expect(hasScreenerParams(new URLSearchParams('maxRSI4=30'))).toBe(true);
	});
});
