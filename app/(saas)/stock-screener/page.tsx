import { selectAllStocks } from '@/lib/db/queries';
import { JSX } from 'react';
import StockDataView from './stock-data-view';

export default async function SaasPage(): Promise<JSX.Element> {
	// todo: sm, lg styling
	const stocks = await selectAllStocks();
	return (
		<main className='p-4'>
			<StockDataView stocks={stocks} />
		</main>
	);
}
