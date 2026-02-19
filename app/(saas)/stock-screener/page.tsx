import { enrichedStockDataList, selectAllStocks } from '@/lib/db/queries';
import { JSX } from 'react';
import StockDataView from './stock-data-view';
import { cacheLife, cacheTag } from 'next/cache';
import z from '@/node_modules/zod/v4/classic/external.cjs';

// cache the request marked with certain tag.
// Python then sends request to /revalidate to mark this tag as stale so that up to date stocks will be fetched
// while not marked as stale the cached data will be used
const getStocks = async (): Promise<z.infer<typeof enrichedStockDataList>> => {
	'use cache';
	cacheTag('stocks-cache');
	cacheLife('days');
	return selectAllStocks();
};

export default async function SaasPage(): Promise<JSX.Element> {
	const stocks = await getStocks();
	return (
		<main className='p-4'>
			<StockDataView stocks={stocks} />
		</main>
	);
}
