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
	useRef,
	useState
} from 'react';
import useSWR, { mutate } from 'swr';
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
	StarIcon,
	HelpCircle
} from 'lucide-react';
import React from 'react';
import z from 'zod';
import { deleteFilter, saveFilter, updateDefaultFilter } from '@/lib/actions';
import { ActionState } from '@/lib/auth/middleware';
import { Switch } from '@/components/ui/switch';
import { Filter } from '@/lib/db/schema';
import {
	TooltipTrigger,
	TooltipContent,
	Tooltip
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

// todo: check where to put this type
type FilterUI = {
	id: string | null;
	name: string;
	createdAt: string | null;
	minVolume: number | null;
	maxRSI4: number | null;
	maxRSI14: number | null;
	minIV: number | null;
	maxIV: number | null;
	minWillr4: number | null;
	maxWillr4: number | null;
	minWillr14: number | null;
	maxWillr14: number | null;
	minStochK: number | null;
	maxStochK: number | null;
	macdIncreasing: boolean;
	macdLineAboveSignal: boolean;
	closeAboveEma20AboveEma50: boolean;
	closeAboveMA200: boolean;
	stochasticsKAboveD: boolean;
};

type Study = { id: string; label: string; inputs?: { length: number } };

const INDICATOR_OPTIONS: Study[] = [
	{ id: 'RSI@tv-basicstudies', label: 'RSI(14)', inputs: { length: 14 } },
	{ id: 'RSI@tv-basicstudies', label: 'RSI(4)', inputs: { length: 4 } },
	{ id: 'MACD@tv-basicstudies', label: 'MACD(12, 26, 9)' },
	{ id: 'Stochastic@tv-basicstudies', label: 'Stoch(14, 3, 3)' }, // will r not supported
	{
		id: 'MASimple@tv-basicstudies',
		label: 'MA(200)',
		inputs: { length: 200 }
	},
	{
		id: 'MAExp@tv-basicstudies',
		label: 'EMA(20)',
		inputs: { length: 20 }
	},
	{
		id: 'MAExp@tv-basicstudies',
		label: 'EMA(50)',
		inputs: { length: 50 }
	}
];

type LastAction = 'save' | 'delete' | 'updateDefault' | null;

const parseFilterUIToFormData = (filter: FilterUI): FormData => {
	const fd = new FormData();

	fd.set('name', filter.name);

	if (filter.minVolume !== undefined) {
		fd.set('minVolume', String(filter.minVolume));
	}

	if (filter.maxRSI4 !== undefined) {
		fd.set('maxRSI4', String(filter.maxRSI4));
	}

	if (filter.maxRSI14 !== undefined) {
		fd.set('maxRSI14', String(filter.maxRSI14));
	}

	if (filter.minIV !== undefined) {
		fd.set('minIV', String(filter.minIV));
	}

	if (filter.maxIV !== undefined) {
		fd.set('maxIV', String(filter.maxIV));
	}

	if (filter.minWillr4 !== undefined) {
		fd.set('minWillr4', String(filter.minWillr4));
	}

	if (filter.maxWillr4 !== undefined) {
		fd.set('maxWillr4', String(filter.maxWillr4));
	}

	if (filter.minWillr14 !== undefined) {
		fd.set('minWillr14', String(filter.minWillr14));
	}

	if (filter.maxWillr14 !== undefined) {
		fd.set('maxWillr14', String(filter.maxWillr14));
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
	if (filter.closeAboveMA200) {
		fd.set('closeAboveMA200', 'on');
	}
	if (filter.stochasticsKAboveD) {
		fd.set('stochasticsKAboveD', 'on');
	}

	return fd;
};

// todo: maybe do this in a more elegant way
const parseFilterDBObjectToFilterUI = (filter: Filter): FilterUI => {
	return {
		id: filter.id,
		name: filter.name,
		createdAt: new Date(filter.createdAt).toISOString(),
		minVolume: filter.minVolume,
		maxRSI4: filter.maxRSI4,
		maxRSI14: filter.maxRSI14,
		minIV: filter.minIV,
		maxIV: filter.maxIV,
		minWillr4: filter.minWillr4,
		maxWillr4: filter.maxWillr4,
		minWillr14: filter.minWillr14,
		maxWillr14: filter.maxWillr14,
		minStochK: filter.minStochK,
		maxStochK: filter.maxStochK,
		macdIncreasing: filter.macdIncreasing ?? false,
		macdLineAboveSignal: filter.macdLineAboveSignal ?? false,
		closeAboveEma20AboveEma50: filter.closeAboveEma20AboveEma50 ?? false,
		closeAboveMA200: filter.closeAboveMA200 ?? false,
		stochasticsKAboveD: filter.stochasticsKAboveD ?? false
	};
};

const SelectFilterCombobox = ({
	allFilters,
	isLoadingAllFilters,
	currentFilter,
	setCurrentFilter,
	saveFilterAction,
	deleteFilterAction,
	updateDefaultFilterAction,
	setLastAction
}: {
	allFilters: Filter[];
	isLoadingAllFilters: boolean;
	currentFilter: FilterUI;
	setCurrentFilter: Dispatch<SetStateAction<FilterUI>>;
	saveFilterAction: (payload: FormData) => void;
	deleteFilterAction: (payload: FormData) => void;
	updateDefaultFilterAction: (payload: FormData) => void;
	setLastAction: Dispatch<SetStateAction<LastAction>>;
}): JSX.Element => {
	const [open, setOpen] = React.useState(false);

	const sortedFilters = allFilters.sort((a, b) => {
		// despite Date type is createdAt an ISO string
		return (
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);
	});

	// make the filter name fix so that changing the filter name input does not change the displayed name
	const fixFilterName = allFilters.find((filter) => {
		return filter.id === currentFilter.id;
	})?.name;

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					{isLoadingAllFilters ? (
						<div className='w-[250px] h-9 rounded-md bg-muted animate-pulse' />
					) : (
						<Button
							variant='outline'
							role='combobox'
							aria-expanded={open}
							className='w-[250px] justify-between'
						>
							{fixFilterName ?? 'Select filter preset...'}
							<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
						</Button>
					)}
				</PopoverTrigger>
				<PopoverContent className='w-[250px] p-1'>
					<Command>
						<CommandList>
							<CommandGroup>
								{sortedFilters.map((filter) => {
									return (
										<div
											key={filter.id}
											className='flex flex-row items-center p-0 mt-1 mb-1'
										>
											<CommandItem
												key={filter.id}
												value={filter.id}
												onSelect={() => {
													setOpen(false);
													setCurrentFilter(
														parseFilterDBObjectToFilterUI(
															filter
														)
													);
												}}
												className='w-3/4 p-0' // 75%
											>
												<Button
													variant={
														currentFilter.id ===
														filter.id
															? 'secondary'
															: 'ghost'
													}
													className={`overflow-auto w-full justify-start ${
														currentFilter.id ===
														filter.id
															? 'bg-secondary'
															: ''
													}`}
												>
													{filter.name}
												</Button>
											</CommandItem>
											<div className='flex flex-row w-1/4'>
												<Button
													variant='link'
													className='w-1/2'
													onClick={() => {
														setLastAction(
															'updateDefault'
														);
														const fd =
															new FormData();
														fd.set('id', filter.id);
														startTransition(() => {
															updateDefaultFilterAction(
																fd
															);
														});
													}}
												>
													<StarIcon
														fill={
															filter.isDefault
																? 'gold'
																: 'none'
														}
													/>
												</Button>
												<Button
													variant='link'
													className='w-1/2'
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

const FilterNumberInput = ({
	label,
	filterValue,
	filterKey,
	setCurrentFilter,
	toolTipContent
}: {
	label: string;
	filterValue: number | null;
	filterKey: string;
	setCurrentFilter: Dispatch<SetStateAction<FilterUI>>;
	toolTipContent?: string | undefined;
}): JSX.Element => {
	return (
		<div className='flex flex-col space-y-1'>
			<div className='flex flex-row gap-1'>
				{/* the tooltip is only rendered when a message is provided; else its discarded */}
				<label className='text-sm font-medium text-muted-foreground text-left'>
					{label}
				</label>
				{toolTipContent && (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className='cursor-pointer'>
								<HelpCircle
									size={14}
									className='text-muted-foreground'
								/>
							</span>
						</TooltipTrigger>
						<TooltipContent className='text-left'>
							{toolTipContent}
						</TooltipContent>
					</Tooltip>
				)}
			</div>
			<Input
				type='number'
				placeholder={'-'}
				value={filterValue ?? ''}
				onChange={(e) => {
					const value = e.target.value === '' ? null : e.target.value;
					setCurrentFilter((prevFilters) => {
						return {
							...prevFilters,
							[filterKey]: value
						};
					});
				}}
			/>
		</div>
	);
};

const FilterSwitchInput = ({
	label,
	checked,
	filterKey,
	setCurrentFilter,
	toolTipContent
}: {
	label: string;
	checked: boolean;
	filterKey: string;
	setCurrentFilter: Dispatch<SetStateAction<FilterUI>>;
	toolTipContent?: string | undefined;
}): JSX.Element => {
	return (
		<label className='flex items-center gap-2 text-sm'>
			<Switch
				checked={checked}
				onCheckedChange={(checked) => {
					setCurrentFilter((prevFilters) => {
						return {
							...prevFilters,
							[filterKey]: checked
						};
					});
				}}
			/>
			{label}
			{/* the tooltip is only rendered when a message is provided; else its discarded */}
			{toolTipContent && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='cursor-pointer'>
							<HelpCircle
								size={14}
								className='text-muted-foreground'
							/>
						</span>
					</TooltipTrigger>
					<TooltipContent>{toolTipContent}</TooltipContent>
				</Tooltip>
			)}
		</label>
	);
};

const FilterRow = ({
	isLoadingAllFilters,
	allFilters,
	currentFilter,
	setCurrentFilter
}: {
	isLoadingAllFilters: boolean;
	allFilters: Filter[];
	currentFilter: FilterUI;
	setCurrentFilter: Dispatch<SetStateAction<FilterUI>>;
}): JSX.Element => {
	const [saveFilterState, saveFilterAction, isSaveFilterPending] =
		useActionState<ActionState, FormData>(saveFilter, {});
	const [deleteFilterState, deleteFilterAction, isDeleteFilterPending] =
		useActionState<ActionState, FormData>(deleteFilter, {});
	const [
		updateDefaultFilterState,
		updateDefaultFilterAction,
		isUpdateDefaultFilterPending
	] = useActionState<ActionState, FormData>(updateDefaultFilter, {});

	const [shouldDisplayActionState, setShouldDisplayActionState] =
		useState<boolean>(false);

	const [lastAction, setLastAction] = useState<LastAction>(null);

	useEffect(() => {
		if (
			(saveFilterState.success ||
				saveFilterState.error ||
				deleteFilterState.success ||
				deleteFilterState.error ||
				updateDefaultFilterState.success ||
				updateDefaultFilterState.error) &&
			!isSaveFilterPending &&
			!isDeleteFilterPending &&
			!isUpdateDefaultFilterPending
		) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setShouldDisplayActionState(true);
			setTimeout(() => {
				setShouldDisplayActionState(false);
			}, 3000);
		}
	}, [
		saveFilterState,
		deleteFilterState,
		updateDefaultFilterState,
		isDeleteFilterPending,
		isSaveFilterPending,
		isUpdateDefaultFilterPending
	]);

	useEffect(() => {
		if (
			saveFilterState.success ||
			deleteFilterState.success ||
			updateDefaultFilterState.success
		) {
			mutate('/api/filters');
		}
	}, [saveFilterState, deleteFilterState, updateDefaultFilterState]);

	useEffect(() => {
		if (saveFilterState.filterId) {
			const newFilter = allFilters.find((filter) => {
				return filter.id === saveFilterState.filterId;
			});
			if (newFilter) {
				setCurrentFilter(parseFilterDBObjectToFilterUI(newFilter));
			}
		}
	}, [allFilters, saveFilterState, setCurrentFilter]);

	return (
		<div className='w-full rounded-xl border p-4 bg-card shadow-sm'>
			<div className='flex flex-row gap-2 items-center h-10'>
				<SelectFilterCombobox
					allFilters={allFilters}
					isLoadingAllFilters={isLoadingAllFilters}
					currentFilter={currentFilter}
					setCurrentFilter={setCurrentFilter}
					saveFilterAction={saveFilterAction}
					deleteFilterAction={deleteFilterAction}
					updateDefaultFilterAction={updateDefaultFilterAction}
					setLastAction={setLastAction}
				/>
				<div className='h-full'>
					{(isSaveFilterPending ||
						isDeleteFilterPending ||
						isUpdateDefaultFilterPending) && (
						<Loader2 className='h-4 w-4 animate-spin' />
					)}
					{shouldDisplayActionState &&
						lastAction === 'save' &&
						saveFilterState.error && (
							<p className='text-red-500'>
								{saveFilterState.error}
							</p>
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
					{shouldDisplayActionState &&
						lastAction === 'updateDefault' &&
						updateDefaultFilterState.error && (
							<p className='text-red-500'>
								{updateDefaultFilterState.error}
							</p>
						)}
					{shouldDisplayActionState &&
						lastAction === 'updateDefault' &&
						updateDefaultFilterState.success && (
							<p className='text-green-500'>
								{updateDefaultFilterState.success}
							</p>
						)}
				</div>
			</div>
			<div className='mt-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4'>
				{/* --- Volume --- */}
				<FilterNumberInput
					label='Min. Volume'
					filterValue={currentFilter.minVolume}
					filterKey='minVolume'
					setCurrentFilter={setCurrentFilter}
				/>

				{/* --- RSI --- */}
				<FilterNumberInput
					label='Max. RSI 4'
					filterValue={currentFilter.maxRSI4}
					filterKey='maxRSI4'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='RSI(4)'
				/>

				<FilterNumberInput
					label='Max. RSI 14'
					filterValue={currentFilter.maxRSI14}
					filterKey='maxRSI14'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='RSI(14)'
				/>

				{/* --- IV --- */}
				<FilterNumberInput
					label='Min. IV'
					filterValue={currentFilter.minIV}
					filterKey='minIV'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='IV(30)'
				/>
				<FilterNumberInput
					label='Max. IV'
					filterValue={currentFilter.maxIV}
					filterKey='maxIV'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='IV(30)'
				/>

				{/* --- WILLR --- */}
				<FilterNumberInput
					label='Min. Williams %R 4'
					filterValue={currentFilter.minWillr4}
					filterKey='minWillr4'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='willr(4)'
				/>
				<FilterNumberInput
					label='Max. Williams %R 4'
					filterValue={currentFilter.maxWillr4}
					filterKey='maxWillr4'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='willr(4)'
				/>

				<FilterNumberInput
					label='Min. Williams %R 14'
					filterValue={currentFilter.minWillr14}
					filterKey='minWillr14'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='willr(14)'
				/>
				<FilterNumberInput
					label='Max. Williams %R 14'
					filterValue={currentFilter.maxWillr14}
					filterKey='maxWillr14'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='willr(14)'
				/>

				{/* --- Stochastics --- */}
				<FilterNumberInput
					label='Min. Stochastics %K'
					filterValue={currentFilter.minStochK}
					filterKey='minStochK'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='stochastic slow(14, 3, 3)'
				/>
				<FilterNumberInput
					label='Max. Stochastics %K'
					filterValue={currentFilter.maxStochK}
					filterKey='maxStochK'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='stochastic slow(14, 3, 3)'
				/>
			</div>

			{/* --- SWITCHES --- */}
			<div className='mt-6 flex flex-col md:flex-row md:items-center gap-4'>
				<FilterSwitchInput
					label='Close &gt; EMA20 &gt; EMA50'
					checked={currentFilter.closeAboveEma20AboveEma50}
					filterKey='closeAboveEma20AboveEma50'
					setCurrentFilter={setCurrentFilter}
				/>

				<FilterSwitchInput
					label='Close &gt; MA200'
					checked={currentFilter.closeAboveMA200}
					filterKey='closeAboveMA200'
					setCurrentFilter={setCurrentFilter}
				/>

				<FilterSwitchInput
					label='MACD increasing (last 3 days)'
					checked={currentFilter.macdIncreasing}
					filterKey='macdIncreasing'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='macd(26, 12, 9)'
				/>

				<FilterSwitchInput
					label='MACD line above signal line'
					checked={currentFilter.macdLineAboveSignal}
					filterKey='macdLineAboveSignal'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='macd(26, 12, 9)'
				/>

				<FilterSwitchInput
					label='Stochastics K% above D%'
					checked={currentFilter.stochasticsKAboveD}
					filterKey='stochasticsKAboveD'
					setCurrentFilter={setCurrentFilter}
					toolTipContent='stochastic slow(14, 3, 3)'
				/>
			</div>
		</div>
	);
};

declare global {
	interface Window {
		TradingView: any;
	}
}
const TradingViewChart = ({
	ticker,
	indicators
}: {
	ticker: string;
	indicators: Study[];
}): JSX.Element => {
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
			studies: indicators,
			container_id: containerId
		});
	}, [indicators, ticker]);

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

	return <div id={containerId} style={{ width: '100%', height: '45vh' }} />;
};

const IndicatorSelector = ({
	selectedIndicators,
	setSelectedIndicators
}: {
	selectedIndicators: Study[];
	setSelectedIndicators: (indicators: Study[]) => void;
}): JSX.Element => {
	const [open, setOpen] = useState(false);

	const handleToggle = (option: (typeof INDICATOR_OPTIONS)[0]): void => {
		const alreadySelected = selectedIndicators.some((i) => {
			return i.label === option.label;
		});
		if (alreadySelected) {
			setSelectedIndicators(
				selectedIndicators.filter((i) => {
					return i.label !== option.label;
				})
			);
		} else if (selectedIndicators.length < 3) {
			setSelectedIndicators([...selectedIndicators, option]);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant='outline' className='w-full'>
					Select Indicators ({selectedIndicators.length}/3)
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-64 p-4'>
				<div className='flex flex-col gap-2'>
					{INDICATOR_OPTIONS.map((option) => {
						return (
							// label as key due to multiple same ids because of trading view indicators with different settings
							<label
								key={option.label}
								className='flex items-center gap-2'
							>
								<Checkbox
									checked={selectedIndicators.some((i) => {
										return i.label === option.label;
									})}
									disabled={
										!selectedIndicators.some((i) => {
											return i.label === option.label;
										}) && selectedIndicators.length >= 3
									}
									onCheckedChange={() => {
										return handleToggle(option);
									}}
								/>
								<span className='text-sm'>{option.label}</span>
							</label>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default function StockDataView({
	stocks
}: {
	stocks: z.infer<typeof enrichedStockDataList>;
}): JSX.Element {
	const { data: allFilters, isLoading: isLoadingAllFilters } = useSWR<
		Filter[]
	>('/api/filters', fetcher); // todo: save indicator state too
	const isInitialFilterSet = useRef(false);

	// initial blank state
	const [currentFilter, setCurrentFilter] = useState<FilterUI>({
		id: null,
		name: 'default filter',
		createdAt: new Date().toISOString(),
		minVolume: null,
		maxRSI4: null,
		maxRSI14: null,
		minIV: null,
		maxIV: null,
		minWillr4: null,
		maxWillr4: null,
		minWillr14: null,
		maxWillr14: null,
		minStochK: null,
		maxStochK: null,
		macdIncreasing: false,
		macdLineAboveSignal: false,
		closeAboveEma20AboveEma50: false,
		closeAboveMA200: false,
		stochasticsKAboveD: false
	});
	const [selectedStock, setSelectedStock] =
		useState<z.infer<typeof enrichedStockData>>();

	// init indicators from local storage
	const [indicators, setIndicators] = useState<Study[]>(() => {
		if (typeof window === 'undefined') {
			return [];
		}

		const saved = localStorage.getItem('indicators');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) {
					return parsed;
				}
			} catch {}
		}

		return [
			INDICATOR_OPTIONS[0],
			INDICATOR_OPTIONS[2],
			INDICATOR_OPTIONS[3]
		];
	});

	// update indicators on local storage
	useEffect(() => {
		localStorage.setItem('indicators', JSON.stringify(indicators));
	}, [indicators]);

	// Sync once SWR resolves
	useEffect(() => {
		if (isInitialFilterSet.current) {
			return;
		}

		if (allFilters && allFilters.length > 0) {
			const defaultFilter = allFilters.find((filter) => {
				return filter.isDefault;
			});
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCurrentFilter(
				parseFilterDBObjectToFilterUI(defaultFilter ?? allFilters[0])
			);

			isInitialFilterSet.current = true;
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
				currentFilter.maxRSI4 !== null &&
				stock.rsi_4 > currentFilter.maxRSI4
			) {
				return false;
			}

			if (
				currentFilter.maxRSI14 !== null &&
				stock.rsi_14 > currentFilter.maxRSI14
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
				currentFilter.minWillr4 !== null &&
				stock.willr_4 > currentFilter.minWillr4
			) {
				return false;
			}

			if (
				currentFilter.maxWillr4 !== null &&
				stock.willr_4 < currentFilter.maxWillr4
			) {
				return false;
			}

			if (
				currentFilter.minWillr14 !== null &&
				stock.willr_14 > currentFilter.minWillr14
			) {
				return false;
			}

			if (
				currentFilter.maxWillr14 !== null &&
				stock.willr_14 < currentFilter.maxWillr14
			) {
				return false;
			}

			if (
				currentFilter.minStochK !== null &&
				stock.stoch_percent_k > currentFilter.minStochK
			) {
				return false;
			}

			if (
				currentFilter.maxStochK !== null &&
				stock.stoch_percent_k > currentFilter.maxStochK
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
				currentFilter.closeAboveMA200 &&
				stock.close < Number(stock.ma_200)
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

	// display first matching symbol by default
	useEffect(() => {
		if (filteredStocks.length) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedStock(filteredStocks[0]);
		}
	}, [filteredStocks]);

	// todo: put into cards
	return (
		<>
			<FilterRow
				isLoadingAllFilters={isLoadingAllFilters}
				allFilters={allFilters ?? []}
				currentFilter={currentFilter}
				setCurrentFilter={setCurrentFilter}
			/>

			<div className='flex flex-col sm:flex-row gap-4 mt-6 max-h-[80vh]'>
				<div className='sm:basis-1/4 min-h-[30vh] max-h-[30vh] sm:min-h-[60vh] sm:max-h-[60vh] overflow-auto rounded-xl border p-4 shadow-sm'>
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
					{selectedStock && (
						<div className='flex flex-col gap-4'>
							<h1 className='text-xl font-bold tracking-tight sm:text-2xl'>
								{selectedStock.ticker}
							</h1>
							<TradingViewChart
								ticker={selectedStock.ticker}
								indicators={indicators}
							/>
							<IndicatorSelector
								selectedIndicators={indicators}
								setSelectedIndicators={setIndicators}
							/>
							<div className='grid grid-cols-3 gap-2'>
								<p>
									Last Updated At:{' '}
									{new Date(
										selectedStock.last_updated_at
									).toDateString()}
								</p>
								<p>
									Implied Volatility:{' '}
									{selectedStock.iv.toPrecision(4)}
								</p>
								<p>
									Signal Date (AMC):{' '}
									{new Date(
										selectedStock.date
									).toDateString()}
								</p>
								<p>
									Williams R% 14:{' '}
									{selectedStock.willr_14.toPrecision(4)}%
								</p>
								<p>
									Williams R% 4:{' '}
									{selectedStock.willr_4.toPrecision(4)}%
								</p>
								<p>
									Average Daily Range (ADR) 20: $
									{selectedStock.adr_20}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
