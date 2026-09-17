'use client';

import { JSX, useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { EnrichedStockData } from '@/lib/schemas/stockSchemas';
import {
	SORTABLE_COLUMNS,
	nextSortState,
	type SortKey,
	type SortState
} from '@/lib/screener/sort';
import {
	adrPercent,
	formatCompact,
	formatNumber,
	EM_DASH
} from '@/lib/screener/format';

/** Columns that stay visible in the narrow results panel. */
const COMPACT_COLUMNS: readonly SortKey[] = [
	'ticker',
	'close',
	'adrPercent',
	'rsi_4',
	'stoch_percent_k'
];

const cellValue = (stock: EnrichedStockData, key: SortKey): string => {
	switch (key) {
		case 'ticker':
			return stock.ticker;
		case 'close':
			return formatNumber(stock.close, 2);
		case 'adrPercent': {
			const value = adrPercent(stock.adr_7, stock.close);
			return value === null ? EM_DASH : formatNumber(value, 2);
		}
		case 'volume':
			return formatCompact(stock.volume);
		case 'iv':
			return formatNumber(stock.iv, 1);
		default:
			return formatNumber(stock[key], 1);
	}
};

export const ResultsTable = ({
	stocks,
	totalCount,
	selectedTicker,
	onSelect,
	sort,
	onSortChange,
	search,
	onSearchChange
}: {
	stocks: readonly EnrichedStockData[];
	totalCount: number;
	selectedTicker: string | null;
	onSelect: (stock: EnrichedStockData) => void;
	sort: SortState;
	onSortChange: (sort: SortState) => void;
	search: string;
	onSearchChange: (search: string) => void;
}): JSX.Element => {
	const bodyRef = useRef<HTMLDivElement>(null);

	// keep the selected row in view when the selection moves by keyboard
	useEffect(() => {
		if (!selectedTicker || !bodyRef.current) {
			return;
		}
		const row = bodyRef.current.querySelector(
			`[data-ticker='${CSS.escape(selectedTicker)}']`
		);
		row?.scrollIntoView({ block: 'nearest' });
	}, [selectedTicker]);

	const moveSelection = (offset: number): void => {
		if (stocks.length === 0) {
			return;
		}
		const currentIndex = stocks.findIndex((stock) => {
			return stock.ticker === selectedTicker;
		});
		const nextIndex = Math.min(
			Math.max(currentIndex + offset, 0),
			stocks.length - 1
		);
		onSelect(stocks[currentIndex === -1 ? 0 : nextIndex]);
	};

	return (
		<div className='flex min-h-0 flex-col rounded-xl border bg-card shadow-sm'>
			<div className='flex flex-col gap-2 border-b p-3'>
				<div className='flex items-baseline justify-between gap-2'>
					<h2 className='text-sm font-semibold'>Matches</h2>
					<p
						className='text-xs text-muted-foreground'
						aria-live='polite'
					>
						{stocks.length} of {totalCount} symbols
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<div className='relative flex-1'>
						<Search className='pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
						<Input
							type='search'
							value={search}
							placeholder='Search symbol…'
							aria-label='Search symbol'
							className='h-8 pl-7 text-sm'
							onChange={(event) => {
								onSearchChange(event.target.value);
							}}
						/>
					</div>
					<label className='sr-only' htmlFor='screener-sort'>
						Sort by
					</label>
					<select
						id='screener-sort'
						className='h-8 rounded-md border bg-transparent px-2 text-xs'
						value={`${sort.key}:${sort.direction}`}
						onChange={(event) => {
							const [key, direction] =
								event.target.value.split(':');
							onSortChange({
								key: key as SortKey,
								direction: direction === 'asc' ? 'asc' : 'desc'
							});
						}}
					>
						{SORTABLE_COLUMNS.flatMap((column) => {
							return [
								<option
									key={`${column.key}:desc`}
									value={`${column.key}:desc`}
								>
									{column.label} ↓
								</option>,
								<option
									key={`${column.key}:asc`}
									value={`${column.key}:asc`}
								>
									{column.label} ↑
								</option>
							];
						})}
					</select>
				</div>
			</div>

			<div
				ref={bodyRef}
				className='min-h-0 flex-1 overflow-auto outline-none'
				tabIndex={0}
				role='group'
				aria-label='Screener results'
				onKeyDown={(event) => {
					if (event.key === 'ArrowDown') {
						event.preventDefault();
						moveSelection(1);
					} else if (event.key === 'ArrowUp') {
						event.preventDefault();
						moveSelection(-1);
					}
				}}
			>
				{stocks.length === 0 ? (
					<p className='p-6 text-center text-sm text-muted-foreground'>
						{totalCount === 0
							? 'No stock data available yet. Run the scraper, or seed the local database with `pnpm db:seed:stocks`.'
							: 'No symbol matches the current filter. Try loosening a bound or selecting more indices.'}
					</p>
				) : (
					<table className='w-full border-collapse text-sm'>
						<thead className='sticky top-0 z-10 bg-card'>
							<tr className='border-b'>
								{SORTABLE_COLUMNS.filter((column) => {
									return COMPACT_COLUMNS.includes(column.key);
								}).map((column) => {
									const isActive = sort.key === column.key;
									return (
										<th
											key={column.key}
											scope='col'
											title={column.title}
											aria-sort={
												isActive
													? sort.direction === 'asc'
														? 'ascending'
														: 'descending'
													: 'none'
											}
											className={cn(
												'px-2 py-2 text-xs font-medium text-muted-foreground',
												column.numeric
													? 'text-right'
													: 'text-left'
											)}
										>
											<button
												type='button'
												className={cn(
													'inline-flex items-center gap-1 hover:text-foreground',
													isActive &&
														'text-foreground'
												)}
												onClick={() => {
													onSortChange(
														nextSortState(
															sort,
															column.key
														)
													);
												}}
											>
												{column.label}
												{isActive &&
													(sort.direction ===
													'asc' ? (
														<ArrowUp className='h-3 w-3' />
													) : (
														<ArrowDown className='h-3 w-3' />
													))}
											</button>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{stocks.map((stock) => {
								const isSelected =
									stock.ticker === selectedTicker;
								return (
									<tr
										key={stock.id}
										data-ticker={stock.ticker}
										aria-selected={isSelected}
										className={cn(
											'cursor-pointer border-b border-border/40 hover:bg-secondary/60',
											isSelected &&
												'bg-secondary font-medium'
										)}
										onClick={() => {
											onSelect(stock);
										}}
									>
										{SORTABLE_COLUMNS.filter((column) => {
											return COMPACT_COLUMNS.includes(
												column.key
											);
										}).map((column) => {
											return (
												<td
													key={column.key}
													className={cn(
														'px-2 py-1.5 tabular-nums',
														column.numeric
															? 'text-right'
															: 'text-left font-medium'
													)}
												>
													{cellValue(
														stock,
														column.key
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};
