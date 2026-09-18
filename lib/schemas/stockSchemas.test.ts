import { buildStock } from '@/lib/screener/testFactories';
import { enrichedStockData, parseStockRows } from './stockSchemas';

describe('enrichedStockData', () => {
	it('accepts a SQL NULL indicator as null', () => {
		const parsed = enrichedStockData.parse(
			buildStock({ rsi_4: null, willr_14: null })
		);
		expect(parsed.rsi_4).toBeNull();
		expect(parsed.willr_14).toBeNull();
	});

	// postgres `double precision` stores NaN and the driver returns JS NaN,
	// which z.number() rejects - this is what broke the production build
	it('normalises a float NaN indicator to null', () => {
		const parsed = enrichedStockData.parse(
			buildStock({
				iv: Number.NaN,
				stoch_percent_k: Number.NaN,
				stoch_percent_d: Number.NaN
			})
		);
		expect(parsed.iv).toBeNull();
		expect(parsed.stoch_percent_k).toBeNull();
		expect(parsed.stoch_percent_d).toBeNull();
	});

	it('still requires a usable price', () => {
		expect(
			enrichedStockData.safeParse(buildStock({ close: Number.NaN }))
				.success
		).toBe(false);
	});
});

describe('parseStockRows', () => {
	it('keeps good rows and drops unusable ones', () => {
		const { stocks, rejected } = parseStockRows([
			buildStock({ id: 1, ticker: 'AAA' }),
			// the exact shape production sent: nulls and NaNs together
			buildStock({
				id: 2,
				ticker: 'BBB',
				rsi_4: null,
				rsi_14: null,
				iv: Number.NaN,
				willr_4: null,
				willr_14: null,
				stoch_percent_k: Number.NaN,
				stoch_percent_d: Number.NaN
			}),
			buildStock({ id: 3, ticker: 'CCC', close: Number.NaN })
		]);

		expect(
			stocks.map((stock) => {
				return stock.ticker;
			})
		).toEqual(['AAA', 'BBB']);
		expect(rejected).toHaveLength(1);
		expect(rejected[0].issue).toContain('close');
	});

	it('returns an empty result rather than throwing', () => {
		expect(parseStockRows([]).stocks).toEqual([]);
	});
});
