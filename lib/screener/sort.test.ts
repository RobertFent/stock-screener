import { DEFAULT_SORT, nextSortState, sortStocks } from './sort';
import { buildStock } from './testFactories';

const stocks = [
	buildStock({ id: 1, ticker: 'CCC', close: 50, adr_7: '1', volume: '100' }),
	buildStock({
		id: 2,
		ticker: 'AAA',
		close: 150,
		adr_7: null,
		volume: '300'
	}),
	buildStock({ id: 3, ticker: 'BBB', close: 100, adr_7: '5', volume: '200' })
];

const tickers = (list: ReturnType<typeof sortStocks>): string[] => {
	return list.map((stock) => {
		return stock.ticker;
	});
};

describe('sortStocks', () => {
	it('sorts alphabetically by symbol', () => {
		expect(tickers(sortStocks(stocks, DEFAULT_SORT))).toEqual([
			'AAA',
			'BBB',
			'CCC'
		]);
	});

	it('sorts numerically in both directions', () => {
		expect(
			tickers(sortStocks(stocks, { key: 'close', direction: 'desc' }))
		).toEqual(['AAA', 'BBB', 'CCC']);
		expect(
			tickers(sortStocks(stocks, { key: 'close', direction: 'asc' }))
		).toEqual(['CCC', 'BBB', 'AAA']);
	});

	it('parses numeric strings instead of comparing them as text', () => {
		expect(
			tickers(sortStocks(stocks, { key: 'volume', direction: 'desc' }))
		).toEqual(['AAA', 'BBB', 'CCC']);
	});

	it('keeps rows without a value at the bottom in both directions', () => {
		expect(
			tickers(
				sortStocks(stocks, { key: 'adrPercent', direction: 'desc' })
			).at(-1)
		).toBe('AAA');
		expect(
			tickers(
				sortStocks(stocks, { key: 'adrPercent', direction: 'asc' })
			).at(-1)
		).toBe('AAA');
	});

	it('does not mutate the input', () => {
		const input = [...stocks];
		sortStocks(input, { key: 'close', direction: 'asc' });
		expect(tickers(input)).toEqual(['CCC', 'AAA', 'BBB']);
	});
});

describe('nextSortState', () => {
	it('toggles direction on the active column', () => {
		expect(
			nextSortState({ key: 'close', direction: 'desc' }, 'close')
		).toEqual({ key: 'close', direction: 'asc' });
	});

	it('starts numeric columns descending and the symbol ascending', () => {
		expect(nextSortState(DEFAULT_SORT, 'rsi_4')).toEqual({
			key: 'rsi_4',
			direction: 'desc'
		});
		expect(
			nextSortState({ key: 'rsi_4', direction: 'desc' }, 'ticker')
		).toEqual({ key: 'ticker', direction: 'asc' });
	});
});
