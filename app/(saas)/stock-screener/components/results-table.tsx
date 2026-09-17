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
import {
	adrEmphasis,
	rsiTone,
	stochTone,
	toneClass,
	willrTone
} from '@/lib/screener/tone';

/**
 * Column visibility is progressive and driven by *container* queries rather
 * than viewport breakpoints: this panel is a fraction of the window, so what
 * matters is how wide the panel itself ended up, not how wide the screen is.
 */
const COLUMN_VISIBILITY: Partial<Record<SortKey, string>> = {
	ticker: '',
	close: '',
	adrPercent: '',
	rsi_4: 'hidden @[300px]:table-cell',
	stoch_percent_k: 'hidden @[370px]:table-cell',
	rsi_14: 'hidden @[440px]:table-cell',
	willr_14: 'hidden @[510px]:table-cell',
	iv: 'hidden @[590px]:table-cell',
	volume: 'hidden @[670px]:table-cell'
};

const VISIBLE_COLUMNS = SORTABLE_COLUMNS.filter((column) => {
	return COLUMN_VISIBILITY[column.key] !== undefined;
});

const cell = (
	stock: EnrichedStockData,
	key: SortKey
): { text: string; className: string } => {
	switch (key) {
		case 'ticker':
			return { text: stock.ticker, className: 'font-medium' };
		case 'close':
			return { text: formatNumber(stock.close, 2), className: '' };
		case 'adrPercent': {
			const value = adrPercent(stock.adr_7, stock.close);
			return {
				text: value === null ? EM_DASH : formatNumber(value, 1),
				className: adrEmphasis(value)
			};
		}
		case 'volume':
			return {
				text: formatCompact(stock.volume),
				className: 'text-muted-foreground'
			};
		case 'iv':
			return { text: formatNumber(stock.iv, 1), className: '' };
		case 'rsi_4':
			return {
				text: formatNumber(stock.rsi_4, 1),
				className: toneClass(rsiTone(stock.rsi_4))
			};
		case 'rsi_14':
			return {
				text: formatNumber(stock.rsi_14, 1),
				className: toneClass(rsiTone(stock.rsi_14))
			};
		case 'willr_4':
			return {
				text: formatNumber(stock.willr_4, 0),
				className: toneClass(willrTone(stock.willr_4))
			};
		case 'willr_14':
			return {
				text: formatNumber(stock.willr_14, 0),
				className: toneClass(willrTone(stock.willr_14))
			};
		case 'stoch_percent_k':
			return {
				text: formatNumber(stock.stoch_percent_k, 1),
				className: toneClass(stochTone(stock.stoch_percent_k))
			};
		default:
			return { text: EM_DASH, className: '' };
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
		if (currentIndex === -1) {
			onSelect(stocks[0]);
			return;
		}
		const nextIndex = Math.min(
			Math.max(currentIndex + offset, 0),
			stocks.length - 1
		);
		onSelect(stocks[nextIndex]);
	};

	return (
		<section className='border-hairline bg-card shadow-elevation-1 flex min-h-0 flex-col overflow-hidden rounded-xl border'>
			<header className='border-hairline flex flex-col gap-2 border-b px-3 py-2.5'>
				<div className='flex items-baseline justify-between gap-2'>
					<h2 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
						Matches
					</h2>
					<p
						className='text-muted-foreground text-xs tabular'
						aria-live='polite'
					>
						<span className='text-foreground font-medium'>
							{stocks.length}
						</span>
						{' / '}
						{totalCount}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<div className='relative flex-1'>
						<Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2' />
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
						className='border-border-strong bg-input text-muted-foreground hover:text-foreground h-8 rounded-md border px-2 text-xs transition-colors'
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
			</header>

			<div
				ref={bodyRef}
				className='scrollbar-slim @container min-h-0 flex-1 overflow-auto outline-none'
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
					<p className='text-muted-foreground p-8 text-center text-sm text-balance'>
						{totalCount === 0
							? 'No stock data yet. Run the scraper, or seed the local database with pnpm db:seed:stocks.'
							: 'No symbol matches the current filter. Loosen a bound or select more indices.'}
					</p>
				) : (
					<table className='w-full border-collapse text-sm'>
						<thead className='bg-card/95 sticky top-0 z-10 backdrop-blur'>
							<tr className='border-hairline border-b'>
								{VISIBLE_COLUMNS.map((column) => {
									const active = sort.key === column.key;
									return (
										<th
											key={column.key}
											scope='col'
											title={column.title}
											aria-sort={
												active
													? sort.direction === 'asc'
														? 'ascending'
														: 'descending'
													: 'none'
											}
											className={cn(
												'text-muted-foreground px-2 py-2 text-[11px] font-medium tracking-wide uppercase',
												column.numeric
													? 'text-right'
													: 'text-left',
												COLUMN_VISIBILITY[column.key]
											)}
										>
											<button
												type='button'
												className={cn(
													'hover:text-foreground inline-flex items-center gap-1 transition-colors',
													active && 'text-foreground'
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
												{active &&
													(sort.direction ===
													'asc' ? (
														<ArrowUp className='size-3' />
													) : (
														<ArrowDown className='size-3' />
													))}
											</button>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{stocks.map((stock) => {
								const selected =
									stock.ticker === selectedTicker;
								return (
									<tr
										key={stock.id}
										data-ticker={stock.ticker}
										aria-selected={selected}
										className={cn(
											'border-border/40 hover:bg-surface-2 cursor-pointer border-b transition-colors',
											selected &&
												'bg-surface-2 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
										)}
										onClick={() => {
											onSelect(stock);
										}}
									>
										{VISIBLE_COLUMNS.map((column) => {
											const { text, className } = cell(
												stock,
												column.key
											);
											return (
												<td
													key={column.key}
													className={cn(
														'px-2 py-1.5 text-[13px] whitespace-nowrap',
														column.numeric
															? 'text-right'
															: 'text-left',
														COLUMN_VISIBILITY[
															column.key
														],
														className,
														selected &&
															column.key ===
																'ticker' &&
															'text-primary'
													)}
												>
													{text}
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

			<footer className='border-hairline text-muted-foreground border-t px-3 py-1.5 text-[11px]'>
				<kbd className='bg-surface-3 rounded px-1 py-0.5'>↑</kbd>{' '}
				<kbd className='bg-surface-3 rounded px-1 py-0.5'>↓</kbd> to
				move through matches
			</footer>
		</section>
	);
};
