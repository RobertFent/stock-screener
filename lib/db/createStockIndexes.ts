/* eslint-disable no-console */
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

/**
 * Creates the indexes the screener query depends on in the *stock analysis*
 * database (`POSTGRES_URL_STOCK_ANALYSIS`), the one the python scraper writes.
 *
 * This deliberately lives outside `lib/db/migrations`: those migrations run
 * against the application database, inside a transaction, and
 * `CREATE INDEX CONCURRENTLY` is not allowed in either context.
 *
 * Safe to run repeatedly and against a live database - `CONCURRENTLY` does not
 * lock out writes, so the scraper can keep running while it builds.
 *
 *   pnpm db:index:stocks
 */
const INDEXES: readonly { name: string; statement: string }[] = [
	{
		name: 'idx_stock_data_ticker_date',
		// the screener reads the three most recent rows per ticker via a
		// lateral join; this index is what keeps that a few index lookups
		statement: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_data_ticker_date
			ON stock_data (ticker, date DESC)`
	}
];

const run = async (): Promise<void> => {
	const url = process.env.POSTGRES_URL_STOCK_ANALYSIS;
	if (!url) {
		throw new Error('POSTGRES_URL_STOCK_ANALYSIS is not set');
	}

	// a single connection, and no transaction wrapper: CREATE INDEX
	// CONCURRENTLY is rejected inside a transaction block
	const sql = postgres(url, { max: 1 });

	try {
		for (const index of INDEXES) {
			console.log(`Creating ${index.name} (concurrently)…`);
			const started = Date.now();
			await sql.unsafe(index.statement);
			console.log(`  done in ${Date.now() - started}ms`);
		}

		const invalid = await sql<{ indexname: string }[]>`
			SELECT c.relname AS indexname
			FROM pg_index i
			JOIN pg_class c ON c.oid = i.indexrelid
			WHERE NOT i.indisvalid
		`;

		if (invalid.length > 0) {
			// a failed CONCURRENTLY build leaves an unusable index behind
			console.warn(
				'Invalid indexes found, drop and recreate them:',
				invalid
					.map((row) => {
						return row.indexname;
					})
					.join(', ')
			);
		}
	} finally {
		await sql.end();
	}
};

run()
	.then(() => {
		console.log('Stock data indexes are in place.');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Failed creating stock data indexes:', error);
		process.exit(1);
	});
