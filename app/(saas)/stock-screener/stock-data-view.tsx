'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enrichedStockData, enrichedStockDataList } from '@/lib/db/queries';
import { fetcher } from '@/lib/utils';
import {
	Dispatch,
	JSX,
	SetStateAction,
	startTransition,
	useActionState,
	useCallback,
	useEffect,
	useMemo,
	useState
} from 'react';
import useSWR, { mutate } from 'swr';
import { FilterBarSkeleton } from './skeletons';
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import {
	ChevronsUpDownIcon,
	Loader2,
	SaveIcon,
	TrashIcon,
	StarIcon
} from 'lucide-react';
import React from 'react';
import z from 'zod';
import { deleteFilter, saveFilter } from '@/lib/actions';
import { ActionState } from '@/lib/auth/middleware';
import { Switch } from '@/components/ui/switch';
import { Filter } from '@/lib/db/schema';

// todo: check where to put this type
type FilterUI = {
	name: string;
	minVolume: number | null;
	maxRSI: number | null;
	minIV: number | null;
	maxIV: number | null;
	minWillr: number | null;
	maxWillr: number | null;
	minStochK: number | null;
	maxStochK: number | null;
	macdIncreasing: boolean;
	macdLineAboveSignal: boolean;
	closeAboveEma20AboveEma50: boolean;
	stochasticsKAboveD: boolean;
};

type LastAction = 'save' | 'delete' | null;

const parseFilterUIToFormData = (filter: FilterUI): FormData => {
	const fd = new FormData();

	fd.set('name', filter.name);

	if (filter.minVolume !== undefined) {
		fd.set('minVolume', String(filter.minVolume));
	}

	if (filter.maxRSI !== undefined) {
		fd.set('maxRSI', String(filter.maxRSI));
	}

	if (filter.minIV !== undefined) {
		fd.set('minIV', String(filter.minIV));
	}

	if (filter.maxIV !== undefined) {
		fd.set('maxIV', String(filter.maxIV));
	}

	if (filter.minWillr !== undefined) {
		fd.set('minWillr', String(filter.minWillr));
	}

	if (filter.maxWillr !== undefined) {
		fd.set('maxWillr', String(filter.maxWillr));
	}

	if (filter.minStochK !== undefined) {
		fd.set('minStochK', String(filter.minStochK));
	}

	if (filter.maxStochK !== undefined) {
		fd.set('maxStochK', String(filter.maxStochK));
	}

	if (filter.macdIncreasing) {
		fd.set('macdIncreasing', 'on');
	}
	if (filter.macdLineAboveSignal) {
		fd.set('macdLineAboveSignal', 'on');
	}
	if (filter.closeAboveEma20AboveEma50) {
		fd.set('closeAboveEma20AboveEma50', 'on');
	}
	if (filter.stochasticsKAboveD) {
		fd.set('stochasticsKAboveD', 'on');
	}

	return fd;
};

const SelectFilterCombobox = ({
	allFilters,
	currentFilter,
	setCurrentFilter,
	saveFilterAction,
	deleteFilterAction,
	setLastAction
}: {
	allFilters: Filter[];
	currentFilter: FilterUI;
	setCurrentFilter: Dispatch<SetStateAction<FilterUI>>;
	saveFilterAction: (payload: FormData) => void;
	deleteFilterAction: (payload: FormData) => void;
	setLastAction: Dispatch<SetStateAction<LastAction>>;
}): JSX.Element => {
	const [open, setOpen] = React.useState(false);
	const [selectedFilterId, setSelectedFilterId] = React.useState('');

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-[200px] justify-between'
					>
						{selectedFilterId
							? (allFilters.find((filter) => {
									return filter.id === selectedFilterId;
								})?.name ?? 'Select filter preset...')
							: 'Select filter preset...'}
						<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[200px] p-0'>
					<Command>
						<CommandList>
							<CommandGroup>
								{allFilters.map((filter) => {
									return (
										<div
											key={filter.id}
											className='flex flex-row justify-between items-center'
										>
											<CommandItem
												key={filter.id}
												value={filter.id}
												onSelect={(currentValue) => {
													setSelectedFilterId(
														currentValue ===
															selectedFilterId
															? ''
															: currentValue
													);
													setOpen(false);
													// todo: enough?
													setCurrentFilter(
														filter as FilterUI
													);
												}}
												className='w-[100%]'
											>
												<Button
													variant={
														selectedFilterId ===
														filter.id
															? 'secondary'
															: 'ghost'
													}
													className={`w-full justify-start ${
														selectedFilterId ===
														filter.id
															? 'bg-secondary'
															: ''
													}`}
												>
													{filter.name}
												</Button>
											</CommandItem>
											<div className='flex flex-row'>
												<Button
													variant='link'
													onClick={() => {
														// todo
													}}
												>
													<StarIcon />
												</Button>
												<Button
													variant='link'
													onClick={() => {
														setLastAction('delete');
														const fd =
															new FormData();
														fd.set('id', filter.id);
														startTransition(() => {
															deleteFilterAction(
																fd
															);
														});
													}}
												>
													<TrashIcon />
												</Button>
											</div>
										</div>
									);
								})}
								<div className='flex flex-row gap-2'>
									<Input
										type='text'
										value={currentFilter.name ?? ''}
										onChange={(e) => {
											setCurrentFilter((prevFilters) => {
												return {
													...prevFilters,
													name: e.target.value
												};
											});
										}}
									/>
									<Button
										variant='link'
										onClick={() => {
											setLastAction('save');
											const fd =
												parseFilterUIToFormData(
													currentFilter
												);
											startTransition(() => {
												saveFilterAction(fd);
											});
											setSelectedFilterId('');
										}}
									>
										<SaveIcon />
									</Button>
								</div>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</>
	);
};

const FilterRow = ({
	allFilters,
	currentFilter,
	setCurrentFilter
}: {
	allFilters: Filter[];
	currentFilter: FilterUI;
	setCurrentFilter: Dispatch<SetStateAction<FilterUI>>;
}): JSX.Element => {
	const [saveFilterState, saveFilterAction, isSaveFilterPending] =
		useActionState<ActionState, FormData>(saveFilter, {});
	const [deleteFilterState, deleteFilterAction, isDeleteFilterPending] =
		useActionState<ActionState, FormData>(deleteFilter, {});

	const [shouldDisplayActionState, setShouldDisplayActionState] =
		useState<boolean>(false);

	const [lastAction, setLastAction] = useState<LastAction>(null);

	useEffect(() => {
		if (
			(saveFilterState.success ||
				saveFilterState.error ||
				deleteFilterState.success ||
				deleteFilterState.error) &&
			!isSaveFilterPending &&
			!isDeleteFilterPending
		) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setShouldDisplayActionState(true);
			setTimeout(() => {
				setShouldDisplayActionState(false);
			}, 2000);
		}
	}, [
		saveFilterState,
		deleteFilterState,
		isDeleteFilterPending,
		isSaveFilterPending
	]);

	const onInputChange = (
		target: HTMLInputElement,
		key: string,
		castToNumber?: boolean
	): void => {
		const value =
			target.value === ''
				? null
				: castToNumber
					? Number(target.value)
					: target.value;
		setCurrentFilter((prevFilters) => {
			return {
				...prevFilters,
				[key]: value
			};
		});
	};

	const onCheckboxChange = (value: boolean, key: string): void => {
		setCurrentFilter((prevFilters) => {
			return {
				...prevFilters,
				[key]: value
			};
		});
	};

	useEffect(() => {
		if (saveFilterState.success || deleteFilterState.success) {
			mutate('/api/filters');
		}
	}, [saveFilterState, deleteFilterState]);

	return (
		<div className='w-full rounded-xl border p-4 bg-card shadow-sm'>
			<div className='flex flex-row gap-2 items-center'>
				<SelectFilterCombobox
					allFilters={allFilters}
					currentFilter={currentFilter}
					setCurrentFilter={setCurrentFilter}
					saveFilterAction={saveFilterAction}
					deleteFilterAction={deleteFilterAction}
					setLastAction={setLastAction}
				/>
				{(isSaveFilterPending || isDeleteFilterPending) && (
					<Loader2 className='h-4 w-4 animate-spin' />
				)}
				{shouldDisplayActionState &&
					lastAction === 'save' &&
					saveFilterState.error && (
						<p className='text-red-500'>{saveFilterState.error}</p>
					)}
				{shouldDisplayActionState &&
					lastAction === 'save' &&
					saveFilterState.success && (
						<p className='text-green-500'>
							{saveFilterState.success}
						</p>
					)}
				{shouldDisplayActionState &&
					lastAction === 'delete' &&
					deleteFilterState.error && (
						<p className='text-red-500'>
							{deleteFilterState.error}
						</p>
					)}
				{shouldDisplayActionState &&
					lastAction === 'delete' &&
					deleteFilterState.success && (
						<p className='text-green-500'>
							{deleteFilterState.success}
						</p>
					)}
			</div>
			{/* // todo: put into one component and re-use */}
			<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{/* --- Volume --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Volume
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.minVolume ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minVolume', true);
						}}
					/>
				</div>

				{/* --- RSI --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. RSI
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.maxRSI ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxRSI');
						}}
					/>
				</div>

				{/* --- IV --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. IV
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.minIV ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minIV');
						}}
					/>
				</div>

				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. IV
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.maxIV ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxIV');
						}}
					/>
				</div>

				{/* --- WILLR --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Williams %R
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.minWillr ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minWillr');
						}}
					/>
				</div>
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. Williams %R
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.maxWillr ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxWillr');
						}}
					/>
				</div>

				{/* --- Stochastics --- */}
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Min. Stochastics %K
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.minStochK ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'minStochK');
						}}
					/>
				</div>
				<div className='flex flex-col space-y-1'>
					<label className='text-sm font-medium text-muted-foreground'>
						Max. Stochastics %K
					</label>
					<Input
						type='number'
						placeholder='-'
						value={currentFilter.maxStochK ?? ''}
						onChange={(e) => {
							return onInputChange(e.target, 'maxStochK');
						}}
					/>
				</div>
			</div>

			{/* --- SWITCHES --- */}
			{/* // todo: put into one component and re-use */}
			<div className='mt-6 flex flex-col md:flex-row md:items-center gap-4'>
				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={
							currentFilter.closeAboveEma20AboveEma50 ?? false
						}
						onCheckedChange={(v) => {
							return onCheckboxChange(
								v,
								'closeAboveEma20AboveEma50'
							);
						}}
					/>
					Close &gt; EMA20 &gt; EMA50
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={currentFilter.macdIncreasing ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(v, 'macdIncreasing');
						}}
					/>
					MACD increasing (last 3 days)
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={currentFilter.macdLineAboveSignal ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(v, 'macdLineAboveSignal');
						}}
					/>
					MACD line above signal line
				</label>

				<label className='flex items-center gap-2 text-sm'>
					<Switch
						checked={currentFilter.stochasticsKAboveD ?? false}
						onCheckedChange={(v) => {
							return onCheckboxChange(v, 'stochasticsKAboveD');
						}}
					/>
					Stochastics K% above D%
				</label>
			</div>
		</div>
	);
};

declare global {
	interface Window {
		TradingView: any;
	}
}
const TradingViewChart = ({ ticker }: { ticker: string }): JSX.Element => {
	const containerId = 'tv_chart_container';

	const createChart = useCallback((): any => {
		if (typeof window.TradingView === 'undefined') {
			return;
		}

		new window.TradingView.widget({
			autosize: true,
			symbol: ticker,
			interval: 'D',
			theme: 'dark',
			style: '1',
			locale: 'en',
			studies: [
				'RSI@tv-basicstudies',
				'MACD@tv-basicstudies', // todo set params for indicators
				'Stochastic@tv-basicstudies'
			],
			container_id: containerId
		});
	}, [ticker]);

	useEffect(() => {
		// remove old chart if it exists
		const oldChart = document.getElementById(containerId);
		if (oldChart) {
			oldChart.innerHTML = '';
		}

		// load script only once
		if (!document.getElementById('tv-script')) {
			const script = document.createElement('script');
			script.id = 'tv-script';
			script.src = 'https://s3.tradingview.com/tv.js';
			script.onload = (): void => {
				return createChart();
			};
			document.body.appendChild(script);
		} else {
			createChart();
		}
	}, [createChart, ticker]);

	return <div id={containerId} style={{ width: '100%', height: '50vh' }} />;
};

export default function StockDataView({
	stocks
}: {
	stocks: z.infer<typeof enrichedStockDataList>;
}): JSX.Element {
	const { data: allFilters, isLoading: isLoadingAllFilters } = useSWR<
		Filter[]
	>('/api/filters', fetcher);
	const [currentFilter, setCurrentFilter] = useState<FilterUI>({
		name: 'default filter',
		minVolume: null,
		maxRSI: null,
		minIV: null,
		maxIV: null,
		minWillr: null,
		maxWillr: null,
		minStochK: null,
		maxStochK: null,
		macdIncreasing: false,
		macdLineAboveSignal: false,
		closeAboveEma20AboveEma50: false,
		stochasticsKAboveD: false
	});
	const [selectedStock, setSelectedStock] =
		useState<z.infer<typeof enrichedStockData>>();

	// Sync once SWR resolves
	useEffect(() => {
		if (allFilters && allFilters.length > 0) {
			// todo: currently use first filter -> change to default filter
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCurrentFilter(allFilters[0] as unknown as FilterUI);
		}
	}, [allFilters]);

	const filteredStocks = useMemo(() => {
		return stocks.filter((stock) => {
			if (
				currentFilter.minVolume !== null &&
				Number(stock.volume) < currentFilter.minVolume
			) {
				return false;
			}

			if (
				currentFilter.maxRSI !== null &&
				stock.rsi > currentFilter.maxRSI
			) {
				return false;
			}

			if (
				currentFilter.minIV !== null &&
				stock.iv < currentFilter.minIV
			) {
				return false;
			}

			if (
				currentFilter.maxIV !== null &&
				stock.iv > currentFilter.maxIV
			) {
				return false;
			}

			if (
				currentFilter.minWillr !== null &&
				stock.iv > currentFilter.minWillr
			) {
				return false;
			}

			if (
				currentFilter.maxWillr !== null &&
				stock.iv > currentFilter.maxWillr
			) {
				return false;
			}

			if (
				currentFilter.minStochK !== null &&
				stock.iv > currentFilter.minStochK
			) {
				return false;
			}

			if (
				currentFilter.maxStochK !== null &&
				stock.iv > currentFilter.maxStochK
			) {
				return false;
			}

			if (
				currentFilter.macdIncreasing &&
				(stock.macd_line < stock.macd_line_prev_day ||
					stock.macd_line_prev_day < stock.macd_line_prev_prev_day)
			) {
				return false;
			}

			if (
				currentFilter.closeAboveEma20AboveEma50 &&
				(stock.close < stock.ema20 || stock.ema20 < stock.ema50)
			) {
				return false;
			}

			if (
				currentFilter.macdLineAboveSignal &&
				stock.macd_line <= stock.signal_line
			) {
				return false;
			}

			if (
				currentFilter.stochasticsKAboveD &&
				stock.stoch_percent_k <= stock.stoch_percent_d
			) {
				return false;
			}

			return true;
		});
	}, [stocks, currentFilter]);

	// todo: put into cards
	// todo: maybe put chart into server component
	return (
		<>
			{isLoadingAllFilters ? (
				<FilterBarSkeleton />
			) : (
				<FilterRow
					allFilters={allFilters ?? []}
					currentFilter={currentFilter}
					setCurrentFilter={setCurrentFilter}
				/>
			)}

			<div className='flex flex-col sm:flex-row gap-4 mt-6 max-h-[80vh]'>
				<div className='sm:basis-1/4 min-h-[20vh] sm:min-h-[60vh] overflow-auto rounded-xl border p-4 bg-card shadow-sm'>
					{/* todo: make header sticky  */}
					<h1 className='text-center sm:mt-6 mb-4'>
						Matching Symbols
					</h1>
					{filteredStocks.map((stock) => {
						return (
							<Button
								variant='outline'
								key={stock.id}
								className='w-full mb-2'
								onClick={() => {
									setSelectedStock(stock);
								}}
							>
								{stock.ticker}
							</Button>
						);
					})}
				</div>
				<div className='sm:basis-3/4 text-center sm:overflow-auto'>
					{selectedStock ? (
						<div className='flex flex-col gap-4'>
							<h1 className='text-xl font-bold tracking-tight sm:text-2xl md:text-4xl'>
								{selectedStock.ticker}
							</h1>
							<TradingViewChart ticker={selectedStock.ticker} />
							<div className='grid grid-cols-2 gap-4'>
								<p>
									Last Updated At:{' '}
									{new Date(
										selectedStock.last_updated_at
									).toDateString()}
								</p>
								<p>
									Implied Volatility:{' '}
									{selectedStock.iv.toPrecision(6)}
								</p>
								<p>
									Signal Date (AMC):{' '}
									{new Date(
										selectedStock.date
									).toDateString()}
								</p>
								<p>
									Williams R%:{' '}
									{selectedStock.willr.toPrecision(6)}
								</p>
							</div>
						</div>
					) : (
						<div className='flex items-center justify-center h-full text-xl'>
							Please select a symbol to see its data
						</div>
					)}
				</div>
			</div>
		</>
	);
}
