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
	ChevronsUpDownIcon,
	HelpCircle,
	Loader2,
	RotateCcw,
	SaveIcon,
	StarIcon,
	TrashIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
		label: 'Min. volume',
		step: 100000,
		tooltip: 'Average daily volume of the last session'
	},
	{ key: 'minClose', label: 'Min. price', step: 1, placeholder: '$' },
	{ key: 'maxClose', label: 'Max. price', step: 1, placeholder: '$' },
	{
		key: 'minAdrPercent7',
		label: 'Min. ADR% 7',
		step: 0.1,
		tooltip:
			'Average daily range over 7 sessions, as a percentage of the closing price. A common momentum-trading floor is 3%.'
	}
];

const MOMENTUM_FIELDS: readonly NumberField[] = [
	{ key: 'maxRSI4', label: 'Max. RSI 4', tooltip: 'RSI(4)' },
	{ key: 'maxRSI14', label: 'Max. RSI 14', tooltip: 'RSI(14)' },
	{
		key: 'minWillr4',
		label: 'Min. Williams %R 4',
		tooltip: 'willr(4), ranges from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'maxWillr4',
		label: 'Max. Williams %R 4',
		tooltip: 'willr(4), ranges from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'minWillr14',
		label: 'Min. Williams %R 14',
		tooltip: 'willr(14), ranges from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'maxWillr14',
		label: 'Max. Williams %R 14',
		tooltip: 'willr(14), ranges from -100 (oversold) to 0 (overbought)'
	},
	{
		key: 'minStochK',
		label: 'Min. Stochastics %K',
		tooltip: 'stochastic slow(14, 3, 3)'
	},
	{
		key: 'maxStochK',
		label: 'Max. Stochastics %K',
		tooltip: 'stochastic slow(14, 3, 3)'
	}
];

const VOLATILITY_FIELDS: readonly NumberField[] = [
	{ key: 'minIV', label: 'Min. IV', tooltip: 'IV(30)' },
	{ key: 'maxIV', label: 'Max. IV', tooltip: 'IV(30)' }
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
		label: 'MACD increasing (last 3 days)',
		tooltip: 'macd(26, 12, 9)'
	},
	{
		key: 'macdLineAboveSignal',
		label: 'MACD line above signal line',
		tooltip: 'macd(26, 12, 9)'
	},
	{
		key: 'stochasticsKAboveD',
		label: 'Stochastics %K above %D',
		tooltip: 'stochastic slow(14, 3, 3)'
	}
];

const InfoTooltip = ({ content }: { content: string }): JSX.Element => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className='cursor-pointer'>
					<HelpCircle size={14} className='text-muted-foreground' />
				</span>
			</TooltipTrigger>
			<TooltipContent className='max-w-72 text-left'>
				{content}
			</TooltipContent>
		</Tooltip>
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
		<div className='flex flex-col space-y-1'>
			<div className='flex flex-row items-center gap-1'>
				<label
					htmlFor={inputId}
					className='text-left text-sm font-medium text-muted-foreground'
				>
					{field.label}
				</label>
				{field.tooltip && <InfoTooltip content={field.tooltip} />}
			</div>
			<Input
				id={inputId}
				type='number'
				step={field.step}
				inputMode='decimal'
				placeholder={field.placeholder ?? '-'}
				value={raw}
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
		<label className='flex items-center gap-2 text-sm'>
			<Switch checked={checked} onCheckedChange={onChange} />
			{label}
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

	const selectedNames = SUPPORTED_INDICES.filter((index) => {
		return indices.includes(index.key);
	})
		.map((index) => {
			return index.value;
		})
		.join(', ');

	return (
		<div className='flex flex-col space-y-1'>
			<span className='text-left text-sm font-medium text-muted-foreground'>
				Indices
			</span>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='justify-start gap-2 overflow-hidden'
					>
						<ChevronsUpDownIcon className='h-4 w-4 shrink-0 opacity-50' />
						<span className='truncate'>
							{selectedNames === '' ? 'None' : selectedNames}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[250px] p-1'>
					<Command>
						<CommandList>
							<CommandGroup>
								{SUPPORTED_INDICES.map((index) => {
									const isSelected = indices.includes(
										index.key
									);
									return (
										<CommandItem
											key={index.key}
											value={index.value}
											className='p-0.5'
											onSelect={() => {
												onChange(
													isSelected
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
													'w-full justify-start rounded px-2 py-1',
													isSelected && 'bg-secondary'
												)}
											>
												{isSelected ? '✓ ' : ''}
												{index.value}
											</span>
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
		<section className='w-full rounded-xl border bg-card p-4 shadow-sm'>
			<div className='flex flex-wrap items-center gap-2'>
				<Popover open={presetOpen} onOpenChange={setPresetOpen}>
					<PopoverTrigger asChild>
						{isLoadingAllFilters ? (
							<div className='h-9 w-[250px] animate-pulse rounded-md bg-muted' />
						) : (
							<Button
								variant='outline'
								role='combobox'
								aria-expanded={presetOpen}
								className='w-[250px] justify-between'
							>
								<span className='truncate'>
									{selectedPresetName ??
										'Select filter preset…'}
								</span>
								<ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						)}
					</PopoverTrigger>
					<PopoverContent className='w-[300px] p-1'>
						<Command>
							<CommandList>
								<CommandGroup>
									{allFilters.length === 0 && (
										<p className='px-2 py-3 text-center text-sm text-muted-foreground'>
											No presets yet. Name the current
											filter below and save it.
										</p>
									)}
									{allFilters.map((filter) => {
										return (
											<div
												key={filter.id}
												className='mt-1 mb-1 flex flex-row items-center p-0'
											>
												<CommandItem
													value={filter.id}
													className='w-3/4 p-0'
													onSelect={() => {
														setPresetOpen(false);
														setCurrentFilter(
															fromDbFilter(filter)
														);
													}}
												>
													<Button
														variant={
															currentFilter.id ===
															filter.id
																? 'secondary'
																: 'ghost'
														}
														className='w-full justify-start overflow-hidden'
													>
														<span className='truncate'>
															{filter.name}
														</span>
													</Button>
												</CommandItem>
												<div className='flex w-1/4 flex-row'>
													<Button
														variant='link'
														className='w-1/2'
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
															startTransition(
																() => {
																	defaultAction(
																		formData
																	);
																}
															);
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
														title='Delete preset'
														aria-label={`Delete ${filter.name}`}
														onClick={() => {
															setLastAction(
																'delete'
															);
															const formData =
																new FormData();
															formData.set(
																'id',
																filter.id
															);
															startTransition(
																() => {
																	deleteAction(
																		formData
																	);
																}
															);
															if (
																currentFilter.id ===
																filter.id
															) {
																setCurrentFilter(
																	(
																		previous
																	) => {
																		return {
																			...previous,
																			id: null
																		};
																	}
																);
															}
														}}
													>
														<TrashIcon />
													</Button>
												</div>
											</div>
										);
									})}
									<div className='mt-2 flex flex-row items-center gap-2 border-t pt-2'>
										<Input
											type='text'
											aria-label='Filter preset name'
											placeholder='Preset name'
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
											variant='link'
											title='Save as new preset'
											aria-label='Save as new preset'
											onClick={() => {
												runSave(true);
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

				<Button
					variant='outline'
					disabled={!currentFilter.id || isPending}
					onClick={() => {
						runSave(false);
					}}
				>
					Update preset
				</Button>

				<Button
					variant='ghost'
					title='Reset all criteria'
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
					<RotateCcw className='mr-1 h-4 w-4' />
					Reset
				</Button>

				<span className='text-xs text-muted-foreground'>
					{activeCriteria === 0
						? 'No criteria active'
						: `${activeCriteria} criteria active`}
				</span>

				<div className='min-w-32'>
					{isPending && <Loader2 className='h-4 w-4 animate-spin' />}
					{!isPending && statusVisible && activeState.error && (
						<p className='text-sm text-red-500'>
							{activeState.error}
						</p>
					)}
					{!isPending && statusVisible && activeState.success && (
						<p className='text-sm text-green-500'>
							{activeState.success}
						</p>
					)}
				</div>
			</div>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6'>
				<IndicesSelect
					indices={currentFilter.indices}
					onChange={(indices) => {
						setCurrentFilter((previous) => {
							return { ...previous, indices };
						});
					}}
				/>
				{[
					...UNIVERSE_FIELDS,
					...VOLATILITY_FIELDS,
					...MOMENTUM_FIELDS
				].map((field) => {
					return (
						<NumberFilterInput
							key={field.key}
							field={field}
							value={currentFilter[field.key]}
							onChange={(value) => {
								setCurrentFilter((previous) => {
									return { ...previous, [field.key]: value };
								});
							}}
						/>
					);
				})}
			</div>

			<div className='mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center'>
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
		</section>
	);
};
