import { connection } from 'next/server';
import { enrichedStockDataList, selectAllStocks } from '@/lib/db/queries';
import { JSX } from 'react';
import StockDataView from './stock-data-view';
import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

// cache the request marked with certain tag.
// Python then sends request to /revalidate to mark this tag as stale so that up to date stocks will be fetched
// while not marked as stale the cached data will be used
const getStocks = async (): Promise<z.infer<typeof enrichedStockDataList>> => {
	'use cache';
	cacheLife({
		stale: 0 // set stale to 0 so that once the cache gets invalidated the client has to wait for the updated data
	});
	cacheTag('stocks-cache');
	return selectAllStocks();
};

export default async function SaasPage(): Promise<JSX.Element> {
	// todo: remove this after query gets faster
	await connection(); // forces dynamic rendering, no build-time prerender -> getStocks won't run into timeout
	const stocks = await getStocks();
	return (
		<main className='p-4'>
			<StockDataView stocks={stocks} />
		</main>
	);
}
