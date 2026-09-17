import { JSX } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { selectAllStocks } from '@/lib/db/queries';
import type { EnrichedStockDataList } from '@/lib/schemas/stockSchemas';
import StockDataView from './stock-data-view';

/**
 * Cached under the `stocks-cache` tag. The python scraper calls
 * `/api/revalidate` once it has written a new batch, which marks the tag stale
 * so the next visitor gets fresh rows.
 */
const getStocks = async (): Promise<EnrichedStockDataList> => {
	'use cache';
	// stale 0 so that clients wait for fresh data instead of being served the
	// previous day's numbers right after an invalidation
	cacheLife({ stale: 0 });
	cacheTag('stocks-cache');
	return selectAllStocks();
};

export default async function StockScreenerPage(): Promise<JSX.Element> {
	const stocks = await getStocks();

	return (
		<main className='mx-auto w-full max-w-[1920px] flex-1 p-3 sm:p-4'>
			<StockDataView stocks={stocks} />
		</main>
	);
}
