/* eslint-disable no-console */
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

/**
 * Seeds the *stock analysis* database with realistic, deterministic test data
 * so the screener can be developed without running the python scraper.
 *
 * Usage:
 *   pnpm db:seed:stocks            # ~150 symbols, 260 sessions each
 *   SEED_DAYS=60 pnpm db:seed:stocks
 *   SEED_FORCE_REMOTE=1 pnpm ...   # required for non local databases
 *
 * The generated prices are a seeded random walk, and every indicator is then
 * computed from that series with the same definitions the screener documents
 * (EMA 20/50, MA 200, RSI 4/14 (Wilder), MACD 12/26/9, Williams %R 4/14,
 * stochastic slow 14/3/3, ADR 7/14). That means the filters behave exactly as
 * they would on production data.
 */

type Index = 'sp100' | 'sp500' | 'nasdaq100';

type Candle = {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
};

const TICKERS: readonly {
	ticker: string;
	index: Index;
	price: number;
	vol: number;
}[] = [
	{ ticker: 'AAPL', index: 'sp100', price: 228, vol: 0.016 },
	{ ticker: 'MSFT', index: 'sp100', price: 424, vol: 0.015 },
	{ ticker: 'NVDA', index: 'sp100', price: 132, vol: 0.032 },
	{ ticker: 'AMZN', index: 'sp100', price: 186, vol: 0.019 },
	{ ticker: 'GOOGL', index: 'sp100', price: 168, vol: 0.018 },
	{ ticker: 'META', index: 'sp100', price: 512, vol: 0.022 },
	{ ticker: 'TSLA', index: 'sp100', price: 248, vol: 0.036 },
	{ ticker: 'BRK.B', index: 'sp100', price: 462, vol: 0.011 },
	{ ticker: 'JPM', index: 'sp100', price: 214, vol: 0.014 },
	{ ticker: 'V', index: 'sp100', price: 284, vol: 0.013 },
	{ ticker: 'UNH', index: 'sp100', price: 572, vol: 0.017 },
	{ ticker: 'XOM', index: 'sp100', price: 118, vol: 0.016 },
	{ ticker: 'JNJ', index: 'sp100', price: 158, vol: 0.011 },
	{ ticker: 'WMT', index: 'sp100', price: 78, vol: 0.013 },
	{ ticker: 'PG', index: 'sp100', price: 168, vol: 0.01 },
	{ ticker: 'MA', index: 'sp100', price: 482, vol: 0.013 },
	{ ticker: 'HD', index: 'sp100', price: 392, vol: 0.015 },
	{ ticker: 'CVX', index: 'sp100', price: 148, vol: 0.016 },
	{ ticker: 'MRK', index: 'sp100', price: 112, vol: 0.014 },
	{ ticker: 'ABBV', index: 'sp100', price: 192, vol: 0.014 },
	{ ticker: 'KO', index: 'sp100', price: 70, vol: 0.01 },
	{ ticker: 'PEP', index: 'sp100', price: 172, vol: 0.011 },
	{ ticker: 'BAC', index: 'sp100', price: 42, vol: 0.018 },
	{ ticker: 'COST', index: 'sp100', price: 884, vol: 0.014 },
	{ ticker: 'MCD', index: 'sp100', price: 296, vol: 0.011 },
	{ ticker: 'CSCO', index: 'sp100', price: 52, vol: 0.014 },
	{ ticker: 'ACN', index: 'sp100', price: 344, vol: 0.015 },
	{ ticker: 'LIN', index: 'sp100', price: 468, vol: 0.012 },
	{ ticker: 'ADBE', index: 'sp100', price: 524, vol: 0.023 },
	{ ticker: 'TMO', index: 'sp100', price: 588, vol: 0.015 },
	{ ticker: 'NFLX', index: 'nasdaq100', price: 702, vol: 0.026 },
	{ ticker: 'AMD', index: 'nasdaq100', price: 154, vol: 0.033 },
	{ ticker: 'INTC', index: 'nasdaq100', price: 23, vol: 0.031 },
	{ ticker: 'QCOM', index: 'nasdaq100', price: 168, vol: 0.023 },
	{ ticker: 'AVGO', index: 'nasdaq100', price: 172, vol: 0.027 },
	{ ticker: 'TXN', index: 'nasdaq100', price: 204, vol: 0.017 },
	{ ticker: 'AMAT', index: 'nasdaq100', price: 196, vol: 0.027 },
	{ ticker: 'MU', index: 'nasdaq100', price: 104, vol: 0.033 },
	{ ticker: 'LRCX', index: 'nasdaq100', price: 78, vol: 0.031 },
	{ ticker: 'KLAC', index: 'nasdaq100', price: 724, vol: 0.026 },
	{ ticker: 'ASML', index: 'nasdaq100', price: 712, vol: 0.026 },
	{ ticker: 'PANW', index: 'nasdaq100', price: 368, vol: 0.026 },
	{ ticker: 'CRWD', index: 'nasdaq100', price: 288, vol: 0.031 },
	{ ticker: 'SNPS', index: 'nasdaq100', price: 502, vol: 0.022 },
	{ ticker: 'CDNS', index: 'nasdaq100', price: 272, vol: 0.023 },
	{ ticker: 'MRVL', index: 'nasdaq100', price: 76, vol: 0.033 },
	{ ticker: 'ADI', index: 'nasdaq100', price: 226, vol: 0.019 },
	{ ticker: 'INTU', index: 'nasdaq100', price: 622, vol: 0.02 },
	{ ticker: 'ISRG', index: 'nasdaq100', price: 486, vol: 0.018 },
	{ ticker: 'BKNG', index: 'nasdaq100', price: 3980, vol: 0.019 },
	{ ticker: 'ABNB', index: 'nasdaq100', price: 124, vol: 0.026 },
	{ ticker: 'PYPL', index: 'nasdaq100', price: 74, vol: 0.025 },
	{ ticker: 'SBUX', index: 'nasdaq100', price: 96, vol: 0.017 },
	{ ticker: 'MDLZ', index: 'nasdaq100', price: 70, vol: 0.012 },
	{ ticker: 'GILD', index: 'nasdaq100', price: 86, vol: 0.016 },
	{ ticker: 'REGN', index: 'nasdaq100', price: 1042, vol: 0.021 },
	{ ticker: 'VRTX', index: 'nasdaq100', price: 466, vol: 0.02 },
	{ ticker: 'ADP', index: 'nasdaq100', price: 276, vol: 0.012 },
	{ ticker: 'CSX', index: 'nasdaq100', price: 34, vol: 0.015 },
	{ ticker: 'PDD', index: 'nasdaq100', price: 138, vol: 0.038 },
	{ ticker: 'DDOG', index: 'nasdaq100', price: 118, vol: 0.031 },
	{ ticker: 'TEAM', index: 'nasdaq100', price: 176, vol: 0.031 },
	{ ticker: 'WDAY', index: 'nasdaq100', price: 234, vol: 0.026 },
	{ ticker: 'ZS', index: 'nasdaq100', price: 182, vol: 0.033 },
	{ ticker: 'FTNT', index: 'nasdaq100', price: 76, vol: 0.026 },
	{ ticker: 'ORLY', index: 'nasdaq100', price: 1128, vol: 0.014 },
	{ ticker: 'ROST', index: 'nasdaq100', price: 148, vol: 0.016 },
	{ ticker: 'MNST', index: 'nasdaq100', price: 50, vol: 0.017 },
	{ ticker: 'KDP', index: 'nasdaq100', price: 36, vol: 0.012 },
	{ ticker: 'EA', index: 'nasdaq100', price: 146, vol: 0.018 }
];

/** Filler symbols so the S&P 500 bucket is realistically large. */
const FILLER_SECTORS = [
	'AER',
	'BIO',
	'CAP',
	'DYN',
	'ENR',
	'FIN',
	'GRD',
	'HLT',
	'IND',
	'LOG'
];

const mulberry32 = (seed: number): (() => number) => {
	let state = seed >>> 0;
	return (): number => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Box-Muller, so returns can be normally distributed rather than uniform. */
const gaussian = (random: () => number): number => {
	const u = Math.max(random(), Number.EPSILON);
	const v = random();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const tradingDays = (count: number, endDate: Date): string[] => {
	const days: string[] = [];
	const cursor = new Date(endDate);
	while (days.length < count) {
		const weekday = cursor.getUTCDay();
		if (weekday !== 0 && weekday !== 6) {
			days.push(cursor.toISOString().slice(0, 10));
		}
		cursor.setUTCDate(cursor.getUTCDate() - 1);
	}
	return days.reverse();
};

const buildSeries = (
	seed: number,
	startPrice: number,
	dailyVol: number,
	days: readonly string[]
): Candle[] => {
	const random = mulberry32(seed);
	const candles: Candle[] = [];
	// a slow drift plus a medium term cycle keeps trends (and therefore the
	// moving average filters) meaningful instead of pure noise
	const drift = (random() - 0.45) * 0.0012;
	const cycleLength = 40 + Math.floor(random() * 60);
	let price = startPrice;

	days.forEach((date, dayIndex) => {
		const cycle =
			Math.sin((dayIndex / cycleLength) * Math.PI * 2) * dailyVol * 0.6;
		const shock = gaussian(random) * dailyVol;
		price = Math.max(price * (1 + drift + cycle + shock), 1);

		const open = price * (1 + gaussian(random) * dailyVol * 0.3);
		const close = price;
		const range =
			Math.abs(gaussian(random)) * dailyVol * price +
			price * dailyVol * 0.4;
		const high = Math.max(open, close) + range * random();
		const low = Math.min(open, close) - range * random();
		const volume = Math.round(
			(2_000_000 + random() * 48_000_000) * (1 + Math.abs(shock) * 12)
		);

		candles.push({
			date,
			open: round(open, 2),
			high: round(high, 2),
			low: round(Math.max(low, 0.5), 2),
			close: round(close, 2),
			volume
		});
	});

	return candles;
};

const round = (value: number, digits: number): number => {
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
};

const sma = (values: readonly number[], period: number): (number | null)[] => {
	const out: (number | null)[] = [];
	let sum = 0;
	values.forEach((value, index) => {
		sum += value;
		if (index >= period) {
			sum -= values[index - period];
		}
		out.push(index >= period - 1 ? sum / period : null);
	});
	return out;
};

const ema = (values: readonly number[], period: number): (number | null)[] => {
	const multiplier = 2 / (period + 1);
	const out: (number | null)[] = [];
	let previous: number | null = null;

	values.forEach((value, index) => {
		if (index < period - 1) {
			out.push(null);
			return;
		}
		if (previous === null) {
			const seed =
				values.slice(index - period + 1, index + 1).reduce((a, b) => {
					return a + b;
				}, 0) / period;
			previous = seed;
		} else {
			previous = (value - previous) * multiplier + previous;
		}
		out.push(previous);
	});

	return out;
};

/** Wilder's RSI, the definition TradingView's `RSI` study uses. */
const rsi = (closes: readonly number[], period: number): (number | null)[] => {
	const out: (number | null)[] = [null];
	let avgGain = 0;
	let avgLoss = 0;

	for (let index = 1; index < closes.length; index++) {
		const change = closes[index] - closes[index - 1];
		const gain = Math.max(change, 0);
		const loss = Math.max(-change, 0);

		if (index <= period) {
			avgGain += gain / period;
			avgLoss += loss / period;
			out.push(index === period ? toRsi(avgGain, avgLoss) : null);
			continue;
		}

		avgGain = (avgGain * (period - 1) + gain) / period;
		avgLoss = (avgLoss * (period - 1) + loss) / period;
		out.push(toRsi(avgGain, avgLoss));
	}

	return out;
};

const toRsi = (avgGain: number, avgLoss: number): number => {
	if (avgLoss === 0) {
		return 100;
	}
	return 100 - 100 / (1 + avgGain / avgLoss);
};

const williamsR = (
	candles: readonly Candle[],
	period: number
): (number | null)[] => {
	return candles.map((candle, index) => {
		if (index < period - 1) {
			return null;
		}
		const window = candles.slice(index - period + 1, index + 1);
		const highest = Math.max(
			...window.map((entry) => {
				return entry.high;
			})
		);
		const lowest = Math.min(
			...window.map((entry) => {
				return entry.low;
			})
		);
		if (highest === lowest) {
			return -50;
		}
		return ((highest - candle.close) / (highest - lowest)) * -100;
	});
};

/** Stochastic slow: %K is a 3 period SMA of fast %K, %D a 3 period SMA of %K. */
const stochasticSlow = (
	candles: readonly Candle[],
	period: number,
	smoothK: number,
	smoothD: number
): { k: (number | null)[]; d: (number | null)[] } => {
	const fastK = candles.map((candle, index) => {
		if (index < period - 1) {
			return 50;
		}
		const window = candles.slice(index - period + 1, index + 1);
		const highest = Math.max(
			...window.map((entry) => {
				return entry.high;
			})
		);
		const lowest = Math.min(
			...window.map((entry) => {
				return entry.low;
			})
		);
		if (highest === lowest) {
			return 50;
		}
		return ((candle.close - lowest) / (highest - lowest)) * 100;
	});

	const k = sma(fastK, smoothK);
	const d = sma(
		k.map((value) => {
			return value ?? 50;
		}),
		smoothD
	);
	return { k, d };
};

const averageDailyRange = (
	candles: readonly Candle[],
	period: number
): (number | null)[] => {
	return candles.map((_, index) => {
		if (index < period - 1) {
			return null;
		}
		const window = candles.slice(index - period + 1, index + 1);
		const total = window.reduce((sum, candle) => {
			return sum + (candle.high - candle.low);
		}, 0);
		return total / period;
	});
};

const DDL = `
CREATE TABLE IF NOT EXISTS stock_data (
	id                SERIAL PRIMARY KEY,
	ticker            TEXT             NOT NULL,
	index             TEXT             NOT NULL,
	date              DATE             NOT NULL,
	open              DOUBLE PRECISION NOT NULL,
	high              DOUBLE PRECISION NOT NULL,
	low               DOUBLE PRECISION NOT NULL,
	close             DOUBLE PRECISION NOT NULL,
	volume            BIGINT           NOT NULL,
	-- indicators are nullable on purpose: production holds NULL (and float NaN)
	-- for symbols with fewer sessions than the indicator's period, so the local
	-- schema has to be able to represent that too
	ema20             DOUBLE PRECISION,
	ema50             DOUBLE PRECISION,
	macd_line         DOUBLE PRECISION,
	signal_line       DOUBLE PRECISION,
	rsi_4             DOUBLE PRECISION,
	rsi_14            DOUBLE PRECISION,
	iv                DOUBLE PRECISION,
	willr_4           DOUBLE PRECISION,
	willr_14          DOUBLE PRECISION,
	stoch_percent_k   DOUBLE PRECISION,
	stoch_percent_d   DOUBLE PRECISION,
	adr_7             NUMERIC(12, 4),
	adr_14            NUMERIC(12, 4),
	ma_200            NUMERIC(12, 4),
	last_updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
	CONSTRAINT stock_data_ticker_date_unique UNIQUE (ticker, date)
);

-- the screener reads the three most recent rows per ticker via a lateral join;
-- this index is what keeps that a few index lookups instead of a full scan.
-- Same name as in production, where pnpm db:index:stocks creates it
-- concurrently.
CREATE INDEX IF NOT EXISTS idx_stock_data_ticker_date
	ON stock_data (ticker, date DESC);
`;

type Row = Record<string, string | number | null>;

const buildRows = (
	ticker: string,
	index: Index,
	seed: number,
	startPrice: number,
	dailyVol: number,
	days: readonly string[],
	lastUpdatedAt: string
): Row[] => {
	const candles = buildSeries(seed, startPrice, dailyVol, days);
	const closes = candles.map((candle) => {
		return candle.close;
	});

	const ema20 = ema(closes, 20);
	const ema50 = ema(closes, 50);
	const ema12 = ema(closes, 12);
	const ema26 = ema(closes, 26);
	const ma200 = sma(closes, 200);
	const rsi4 = rsi(closes, 4);
	const rsi14 = rsi(closes, 14);
	const willr4 = williamsR(candles, 4);
	const willr14 = williamsR(candles, 14);
	const stoch = stochasticSlow(candles, 14, 3, 3);
	const adr7 = averageDailyRange(candles, 7);
	const adr14 = averageDailyRange(candles, 14);

	const macdLine = closes.map((_, i) => {
		const fast = ema12[i];
		const slow = ema26[i];
		return fast === null || slow === null ? null : fast - slow;
	});
	const signalLine = ema(
		macdLine.map((value) => {
			return value ?? 0;
		}),
		9
	);

	// implied volatility loosely tracks the realised range, as it does in life
	const ivBase = dailyVol * Math.sqrt(252) * 100;

	return candles.map((candle, i) => {
		return {
			ticker,
			index,
			date: candle.date,
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			volume: candle.volume,
			ema20: round(ema20[i] ?? candle.close, 4),
			ema50: round(ema50[i] ?? candle.close, 4),
			macd_line: round(macdLine[i] ?? 0, 6),
			signal_line: round(signalLine[i] ?? 0, 6),
			rsi_4: round(rsi4[i] ?? 50, 4),
			rsi_14: round(rsi14[i] ?? 50, 4),
			iv: round(
				ivBase *
					(0.75 + ((adr7[i] ?? 0) / Math.max(candle.close, 1)) * 12),
				4
			),
			willr_4: round(willr4[i] ?? -50, 4),
			willr_14: round(willr14[i] ?? -50, 4),
			stoch_percent_k: round(stoch.k[i] ?? 50, 4),
			stoch_percent_d: round(stoch.d[i] ?? 50, 4),
			adr_7: adr7[i] === null ? null : round(adr7[i] as number, 4),
			adr_14: adr14[i] === null ? null : round(adr14[i] as number, 4),
			ma_200: ma200[i] === null ? null : round(ma200[i] as number, 4),
			last_updated_at: lastUpdatedAt
		};
	});
};

const buildUniverse = (): typeof TICKERS => {
	const random = mulberry32(20260917);
	const generated = FILLER_SECTORS.flatMap((sector) => {
		return Array.from({ length: 8 }, (_, position) => {
			return {
				ticker: `${sector}${String(position + 1).padStart(2, '0')}`,
				index: 'sp500' as Index,
				price: round(8 + random() * 420, 2),
				vol: round(0.01 + random() * 0.03, 4)
			};
		});
	});
	return [...TICKERS, ...generated];
};

const isLocalDatabase = (url: string): boolean => {
	return /@(localhost|127\.0\.0\.1|host\.docker\.internal|postgres)[:/]/.test(
		url
	);
};

const seed = async (): Promise<void> => {
	const url = process.env.POSTGRES_URL_STOCK_ANALYSIS;
	if (!url) {
		throw new Error(
			'POSTGRES_URL_STOCK_ANALYSIS is not set. Copy .env.example to .env first.'
		);
	}

	if (!isLocalDatabase(url) && process.env.SEED_FORCE_REMOTE !== '1') {
		throw new Error(
			'POSTGRES_URL_STOCK_ANALYSIS does not look like a local database. ' +
				'Re-run with SEED_FORCE_REMOTE=1 if you really mean to overwrite it.'
		);
	}

	const days = Number(process.env.SEED_DAYS ?? 260);
	const universe = buildUniverse();
	const lastUpdatedAt = new Date().toISOString();
	const dates = tradingDays(days, new Date());

	const sql = postgres(url, { max: 4 });

	try {
		console.log('Creating stock_data table and index (if needed)…');
		await sql.unsafe(DDL);

		console.log('Clearing previous test data…');
		await sql`TRUNCATE TABLE stock_data RESTART IDENTITY`;

		console.log(
			`Generating ${universe.length} symbols × ${dates.length} sessions…`
		);

		let inserted = 0;
		for (const [position, entry] of universe.entries()) {
			const rows = buildRows(
				entry.ticker,
				entry.index,
				position * 7919 + 13,
				entry.price,
				entry.vol,
				dates,
				lastUpdatedAt
			);

			// chunked so a single statement never gets absurdly large
			for (let offset = 0; offset < rows.length; offset += 500) {
				const chunk = rows.slice(offset, offset + 500);
				await sql`INSERT INTO stock_data ${sql(chunk)}`;
				inserted += chunk.length;
			}
		}

		const [{ count }] = await sql<
			{ count: string }[]
		>`SELECT COUNT(*)::text AS count FROM stock_data`;

		console.log(
			`Inserted ${inserted} rows (${count} in table) for ${universe.length} symbols.`
		);
		console.log('Latest session:', dates[dates.length - 1]);
	} finally {
		await sql.end();
	}
};

seed()
	.then(() => {
		console.log('Stock data seed finished.');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Stock data seed failed:', error);
		process.exit(1);
	});
