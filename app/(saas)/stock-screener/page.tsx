import { selectAllStocks } from '@/lib/db/queries';
import { JSX } from 'react';
import StockDataView from './stock-data-view';

export const revalidate = 43200; // invalidate cache every 12h

export default async function SaasPage(): Promise<JSX.Element> {
	const stocks = await selectAllStocks();
	return (
		<main className='p-4'>
			<StockDataView stocks={stocks} />
		</main>
	);
}
