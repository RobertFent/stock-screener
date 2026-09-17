'use client';

import {
	Dispatch,
	JSX,
	SetStateAction,
	startTransition,
	useActionState,
	useEffect,
	useId,
	useMemo,
	useState
} from 'react';
import { mutate } from 'swr';
import {
	Check,
	ChevronDown,
	ChevronsUpDownIcon,
	HelpCircle,
	Loader2,
	RotateCcw,
	SaveIcon,
	StarIcon,
	TrashIcon
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { deleteFilter, saveFilter, updateDefaultFilter } from '@/lib/actions';
import type { ActionState } from '@/lib/auth/middleware';
import type { Filter } from '@/lib/db/schema';
import { SUPPORTED_INDICES } from '@/lib/screener/constants';
import {
	countActiveCriteria,
	createEmptyFilter,
	fromDbFilter,
	toFormData,
	type BooleanFilterKey,
	type NumericFilterKey,
	type ScreenerFilter
} from '@/lib/screener/filter';

const PANEL_STORAGE_KEY = 'screener:filters-open';

type NumberField = {
	key: NumericFilterKey;
	label: string;
	tooltip?: string;
	step?: number;
	placeholder?: string;
};

const UNIVERSE_FIELDS: readonly NumberField[] = [
	{
		key: 'minVolume',
		label: 'Min vol',
		step: 100000,
		tooltip: 'Traded volume of the last session'
	},
	{ key: 'minClose', label: 'Min price', step: 1, placeholder: '$' },
	{ key: 'maxClose', label: 'Max price', step: 1, placeholder: '$' },
	{
		key: 'minAdrPercent7',
		label: 'Min ADR%',
		step: 0.1,
		tooltip:
			'Average daily range over 7 sessions as a percentage of the close. A common momentum-trading floor is 3%.'
	}
];

const VOLATILITY_FIELDS: readonly NumberField[] = [
	{ key: 'minIV', label: 'Min IV', tooltip: 'IV(30)' },
	{ key: 'maxIV', label: 'Max IV', tooltip: 'IV(30)' }
];

const MOMENTUM_FIELDS: readonly NumberField[] = [
	{ key: 'maxRSI4', label: 'Max RSI 4', tooltip: 'RSI(4)' },
	{ key: 'maxRSI14', label: 'Max RSI 14', tooltip: 'RSI(14)' },
	{
		key: 'minWillr4',
		label: 'Min %R 4',
		tooltip: 'willr(4) — runs from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'maxWillr4',
		label: 'Max %R 4',
		tooltip: 'willr(4) — runs from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'minWillr14',
		label: 'Min %R 14',
		tooltip: 'willr(14) — runs from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'maxWillr14',
		label: 'Max %R 14',
		tooltip: 'willr(14) — runs from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'minStochK',
		label: 'Min %K',
		tooltip: 'stochastic slow(14, 3, 3)'
	},
	{
		key: 'maxStochK',
		label: 'Max %K',
		tooltip: 'stochastic slow(14, 3, 3)'
	}
];

const SWITCH_FIELDS: readonly {
	key: BooleanFilterKey;
	label: string;
	tooltip?: string;
}[] = [
	{ key: 'closeAboveEma20AboveEma50', label: 'Close > EMA20 > EMA50' },
	{ key: 'closeAboveMA200', label: 'Close > MA200' },
	{
		key: 'macdIncreasing',
		label: 'MACD rising (3d)',
		tooltip: 'macd(26, 12, 9)'
	},
	{
		key: 'macdLineAboveSignal',
		label: 'MACD > signal',
		tooltip: 'macd(26, 12, 9)'
	},
	{
		key: 'stochasticsKAboveD',
		label: '%K > %D',
		tooltip: 'stochastic slow(14, 3, 3)'
	}
];

const InfoTooltip = ({ content }: { content: string }): JSX.Element => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className='text-muted-foreground/70 hover:text-muted-foreground cursor-help transition-colors'>
					<HelpCircle className='size-3' />
				</span>
			</TooltipTrigger>
			<TooltipContent className='text-left'>{content}</TooltipContent>
		</Tooltip>
	);
};

const FieldLabel = ({
	htmlFor,
	label,
	tooltip,
	active
}: {
	htmlFor?: string;
	label: string;
	tooltip?: string;
	active?: boolean;
}): JSX.Element => {
	return (
		<div className='flex items-center gap-1'>
			<label
				htmlFor={htmlFor}
				className={cn(
					'text-[11px] font-medium tracking-wide uppercase transition-colors',
					active ? 'text-primary' : 'text-muted-foreground'
				)}
			>
				{label}
			</label>
			{tooltip && <InfoTooltip content={tooltip} />}
		</div>
	);
};

/**
 * Numeric filter input. Keeps the raw string internally so partial input such
 * as `-` or `1.` stays editable, but always reports a real `number | null`
 * upwards - the filter predicate must never compare against strings.
 */
const NumberFilterInput = ({
	field,
	value,
	onChange
}: {
	field: NumberField;
	value: number | null;
	onChange: (value: number | null) => void;
}): JSX.Element => {
	const inputId = useId();
	const [raw, setRaw] = useState(value === null ? '' : String(value));
	const [lastValue, setLastValue] = useState(value);

	// adjust state during render instead of in an effect when the preset changes
	if (value !== lastValue) {
		setLastValue(value);
		setRaw(value === null ? '' : String(value));
	}

	return (
		<div className='flex flex-col gap-1'>
			<FieldLabel
				htmlFor={inputId}
				label={field.label}
				tooltip={field.tooltip}
				active={value !== null}
			/>
			<Input
				id={inputId}
				type='number'
				step={field.step}
				inputMode='decimal'
				placeholder={field.placeholder ?? '–'}
				value={raw}
				className={cn(
					'h-8 px-2 text-[13px] tabular',
					value !== null && 'border-primary/40 text-foreground'
				)}
				onChange={(event) => {
					const next = event.target.value;
					setRaw(next);
					setLastValue(next === '' ? null : Number(next));
					if (next === '') {
						onChange(null);
						return;
					}
					const parsed = Number(next);
					onChange(Number.isFinite(parsed) ? parsed : null);
				}}
			/>
		</div>
	);
};

const SwitchFilterInput = ({
	label,
	tooltip,
	checked,
	onChange
}: {
	label: string;
	tooltip?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}): JSX.Element => {
	return (
		<label
			className={cn(
				'border-hairline flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors',
				checked
					? 'border-primary/40 bg-primary/8 text-foreground'
					: 'bg-surface-1 text-muted-foreground hover:bg-surface-2'
			)}
		>
			<Switch checked={checked} onCheckedChange={onChange} />
			<span className='whitespace-nowrap'>{label}</span>
			{tooltip && <InfoTooltip content={tooltip} />}
		</label>
	);
};

const IndicesSelect = ({
	indices,
	onChange
}: {
	indices: ScreenerFilter['indices'];
	onChange: (indices: ScreenerFilter['indices']) => void;
}): JSX.Element => {
	const [open, setOpen] = useState(false);

	const label =
		indices.length === 0
			? 'None'
			: indices.length === SUPPORTED_INDICES.length
				? 'All indices'
				: SUPPORTED_INDICES.filter((index) => {
						return indices.includes(index.key);
					})
						.map((index) => {
							return index.value;
						})
						.join(', ');

	return (
		<div className='flex flex-col gap-1'>
			<FieldLabel
				label='Indices'
				active={
					indices.length > 0 &&
					indices.length < SUPPORTED_INDICES.length
				}
			/>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='h-8 justify-between gap-2 px-2 text-[13px] font-normal'
					>
						<span className='truncate'>{label}</span>
						<ChevronsUpDownIcon className='size-3.5 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent align='start' className='w-56 p-1'>
					<Command>
						<CommandList>
							<CommandGroup>
								{SUPPORTED_INDICES.map((index) => {
									const selected = indices.includes(
										index.key
									);
									return (
										<CommandItem
											key={index.key}
											value={index.value}
											className='cursor-pointer gap-2 text-sm'
											onSelect={() => {
												onChange(
													selected
														? indices.filter(
																(key) => {
																	return (
																		key !==
																		index.key
																	);
																}
															)
														: [
																...indices,
																index.key
															]
												);
											}}
										>
											<span
												className={cn(
													'border-border-strong flex size-4 items-center justify-center rounded border',
													selected &&
														'border-primary bg-primary text-primary-foreground'
												)}
											>
												{selected && (
													<Check className='size-3' />
												)}
											</span>
											{index.value}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

const FieldGroup = ({
	title,
	className,
	children
}: {
	title: string;
	className?: string;
	children: React.ReactNode;
}): JSX.Element => {
	return (
		<section className={className}>
			<h3 className='text-muted-foreground/70 mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase'>
				{title}
			</h3>
			{children}
		</section>
	);
};

type LastAction = 'save' | 'delete' | 'updateDefault' | null;

export const FilterPanel = ({
	allFilters,
	isLoadingAllFilters,
	currentFilter,
	setCurrentFilter
}: {
	allFilters: readonly Filter[];
	isLoadingAllFilters: boolean;
	currentFilter: ScreenerFilter;
	setCurrentFilter: Dispatch<SetStateAction<ScreenerFilter>>;
}): JSX.Element => {
	const [presetOpen, setPresetOpen] = useState(false);
	const [lastAction, setLastAction] = useState<LastAction>(null);
	const [expanded, setExpanded] = useState(true);

	const [saveState, saveAction, isSavePending] = useActionState<
		ActionState,
		FormData
	>(saveFilter, {});
	const [deleteState, deleteAction, isDeletePending] = useActionState<
		ActionState,
		FormData
	>(deleteFilter, {});
	const [defaultState, defaultAction, isDefaultPending] = useActionState<
		ActionState,
		FormData
	>(updateDefaultFilter, {});

	const isPending = isSavePending || isDeletePending || isDefaultPending;

	const activeState = useMemo((): ActionState => {
		switch (lastAction) {
			case 'save':
				return saveState;
			case 'delete':
				return deleteState;
			case 'updateDefault':
				return defaultState;
			default:
				return {};
		}
	}, [lastAction, saveState, deleteState, defaultState]);

	// the outcome of the last action is shown for a few seconds, then dismissed
	const [dismissedState, setDismissedState] = useState<ActionState | null>(
		null
	);
	const statusVisible =
		activeState !== dismissedState &&
		Boolean(activeState.success || activeState.error);

	useEffect(() => {
		if (isPending || !(activeState.success || activeState.error)) {
			return;
		}
		const timeout = setTimeout(() => {
			setDismissedState(activeState);
		}, 3000);
		return (): void => {
			clearTimeout(timeout);
		};
	}, [activeState, isPending]);

	// restore the collapsed state after hydration so SSR markup stays stable
	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(PANEL_STORAGE_KEY);
			if (stored !== null) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setExpanded(stored === '1');
			}
		} catch {
			// storage can be unavailable; the default is fine
		}
	}, []);

	const toggleExpanded = (): void => {
		setExpanded((open) => {
			const next = !open;
			try {
				window.localStorage.setItem(
					PANEL_STORAGE_KEY,
					next ? '1' : '0'
				);
			} catch {
				// non critical
			}
			return next;
		});
	};

	// refresh the preset list after every successful mutation
	useEffect(() => {
		if (saveState.success || deleteState.success || defaultState.success) {
			void mutate('/api/filters');
		}
	}, [saveState, deleteState, defaultState]);

	// adopt the id of a newly created preset so the next save updates it
	useEffect(() => {
		if (!saveState.filterId) {
			return;
		}
		const saved = allFilters.find((filter) => {
			return filter.id === saveState.filterId;
		});
		if (saved) {
			setCurrentFilter(fromDbFilter(saved));
		}
	}, [allFilters, saveState, setCurrentFilter]);

	const runSave = (asNew: boolean): void => {
		setLastAction('save');
		const formData = toFormData(
			asNew ? { ...currentFilter, id: null } : currentFilter
		);
		startTransition(() => {
			saveAction(formData);
		});
	};

	const activeCriteria = countActiveCriteria(currentFilter);
	const selectedPresetName = allFilters.find((filter) => {
		return filter.id === currentFilter.id;
	})?.name;

	return (
		<section className='border-hairline bg-card shadow-elevation-1 rounded-xl border'>
			<div className='flex flex-wrap items-center gap-2 px-3 py-2.5'>
				<Popover open={presetOpen} onOpenChange={setPresetOpen}>
					<PopoverTrigger asChild>
						{isLoadingAllFilters ? (
							<Skeleton className='h-8 w-56' />
						) : (
							<Button
								variant='outline'
								role='combobox'
								size='sm'
								aria-expanded={presetOpen}
								className='w-56 justify-between font-normal'
							>
								<span className='truncate'>
									{selectedPresetName ?? 'No preset selected'}
								</span>
								<ChevronsUpDownIcon className='size-3.5 shrink-0 opacity-50' />
							</Button>
						)}
					</PopoverTrigger>
					<PopoverContent align='start' className='w-80 p-2'>
						<Command>
							<CommandList>
								<CommandGroup>
									{allFilters.length === 0 && (
										<p className='text-muted-foreground px-2 py-4 text-center text-sm text-balance'>
											No presets yet. Name the current
											filter below and save it.
										</p>
									)}
									{allFilters.map((filter) => {
										const selected =
											currentFilter.id === filter.id;
										return (
											<div
												key={filter.id}
												className={cn(
													'group flex items-center gap-1 rounded-md pr-1',
													selected && 'bg-surface-2'
												)}
											>
												<CommandItem
													value={filter.id}
													className='flex-1 cursor-pointer gap-2 text-sm'
													onSelect={() => {
														setPresetOpen(false);
														setCurrentFilter(
															fromDbFilter(filter)
														);
													}}
												>
													<span
														className={cn(
															'truncate',
															selected &&
																'text-primary font-medium'
														)}
													>
														{filter.name}
													</span>
													{filter.isDefault && (
														<Badge
															variant='muted'
															size='sm'
															className='ml-auto'
														>
															default
														</Badge>
													)}
												</CommandItem>
												<Button
													variant='subtle'
													size='icon-xs'
													title='Make default'
													aria-label={`Make ${filter.name} the default filter`}
													onClick={() => {
														setLastAction(
															'updateDefault'
														);
														const formData =
															new FormData();
														formData.set(
															'id',
															filter.id
														);
														startTransition(() => {
															defaultAction(
																formData
															);
														});
													}}
												>
													<StarIcon
														className={cn(
															'size-3.5',
															filter.isDefault &&
																'fill-primary text-primary'
														)}
													/>
												</Button>
												<Button
													variant='subtle'
													size='icon-xs'
													title='Delete preset'
													aria-label={`Delete ${filter.name}`}
													className='hover:text-destructive'
													onClick={() => {
														setLastAction('delete');
														const formData =
															new FormData();
														formData.set(
															'id',
															filter.id
														);
														startTransition(() => {
															deleteAction(
																formData
															);
														});
														if (
															currentFilter.id ===
															filter.id
														) {
															setCurrentFilter(
																(previous) => {
																	return {
																		...previous,
																		id: null
																	};
																}
															);
														}
													}}
												>
													<TrashIcon className='size-3.5' />
												</Button>
											</div>
										);
									})}
									<div className='border-hairline mt-2 flex items-center gap-2 border-t pt-2'>
										<Input
											type='text'
											aria-label='Filter preset name'
											placeholder='New preset name'
											className='h-8'
											value={currentFilter.name}
											onChange={(event) => {
												setCurrentFilter((previous) => {
													return {
														...previous,
														name: event.target.value
													};
												});
											}}
										/>
										<Button
											size='sm'
											title='Save as new preset'
											aria-label='Save as new preset'
											onClick={() => {
												runSave(true);
											}}
										>
											<SaveIcon />
											Save
										</Button>
									</div>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				<Button
					variant='outline'
					size='sm'
					disabled={!currentFilter.id || isPending}
					onClick={() => {
						runSave(false);
					}}
				>
					Update
				</Button>

				<Button
					variant='ghost'
					size='sm'
					title='Clear all criteria'
					onClick={() => {
						setCurrentFilter((previous) => {
							return {
								...createEmptyFilter(),
								id: previous.id,
								name: previous.name,
								createdAt: previous.createdAt
							};
						});
					}}
				>
					<RotateCcw />
					Reset
				</Button>

				<Badge variant={activeCriteria > 0 ? 'default' : 'muted'}>
					{activeCriteria === 0
						? 'No criteria'
						: `${activeCriteria} active`}
				</Badge>

				<div className='min-w-0 flex-1'>
					{isPending && (
						<Loader2 className='text-muted-foreground size-4 animate-spin' />
					)}
					{!isPending && statusVisible && activeState.error && (
						<p className='text-destructive truncate text-xs'>
							{activeState.error}
						</p>
					)}
					{!isPending && statusVisible && activeState.success && (
						<p className='text-bullish truncate text-xs'>
							{activeState.success}
						</p>
					)}
				</div>

				<Button
					variant='ghost'
					size='sm'
					aria-expanded={expanded}
					aria-controls='screener-filter-body'
					onClick={toggleExpanded}
				>
					{expanded ? 'Hide filters' : 'Show filters'}
					<ChevronDown
						className={cn(
							'transition-transform duration-200',
							expanded && 'rotate-180'
						)}
					/>
				</Button>
			</div>

			{expanded && (
				<div
					id='screener-filter-body'
					className='border-hairline grid gap-x-6 gap-y-5 border-t px-3 py-4 lg:grid-cols-12'
				>
					<FieldGroup title='Universe' className='lg:col-span-5'>
						<div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3'>
							<IndicesSelect
								indices={currentFilter.indices}
								onChange={(indices) => {
									setCurrentFilter((previous) => {
										return { ...previous, indices };
									});
								}}
							/>
							{UNIVERSE_FIELDS.map((field) => {
								return (
									<NumberFilterInput
										key={field.key}
										field={field}
										value={currentFilter[field.key]}
										onChange={(value) => {
											setCurrentFilter((previous) => {
												return {
													...previous,
													[field.key]: value
												};
											});
										}}
									/>
								);
							})}
						</div>
					</FieldGroup>

					<FieldGroup title='Volatility' className='lg:col-span-2'>
						<div className='grid grid-cols-2 gap-2'>
							{VOLATILITY_FIELDS.map((field) => {
								return (
									<NumberFilterInput
										key={field.key}
										field={field}
										value={currentFilter[field.key]}
										onChange={(value) => {
											setCurrentFilter((previous) => {
												return {
													...previous,
													[field.key]: value
												};
											});
										}}
									/>
								);
							})}
						</div>
					</FieldGroup>

					<FieldGroup title='Momentum' className='lg:col-span-5'>
						<div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
							{MOMENTUM_FIELDS.map((field) => {
								return (
									<NumberFilterInput
										key={field.key}
										field={field}
										value={currentFilter[field.key]}
										onChange={(value) => {
											setCurrentFilter((previous) => {
												return {
													...previous,
													[field.key]: value
												};
											});
										}}
									/>
								);
							})}
						</div>
					</FieldGroup>

					<FieldGroup title='Conditions' className='lg:col-span-12'>
						<div className='flex flex-wrap gap-2'>
							{SWITCH_FIELDS.map((field) => {
								return (
									<SwitchFilterInput
										key={field.key}
										label={field.label}
										tooltip={field.tooltip}
										checked={currentFilter[field.key]}
										onChange={(checked) => {
											setCurrentFilter((previous) => {
												return {
													...previous,
													[field.key]: checked
												};
											});
										}}
									/>
								);
							})}
						</div>
					</FieldGroup>
				</div>
			)}
		</section>
	);
};
