'use client';

import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import {
	INDICATOR_OPTIONS,
	MAX_SELECTED_INDICATORS,
	type Study
} from '@/lib/screener/constants';

export const IndicatorSelector = ({
	selected,
	onChange
}: {
	selected: readonly Study[];
	onChange: (indicators: Study[]) => void;
}): JSX.Element => {
	const [open, setOpen] = useState(false);

	const toggle = (option: Study): void => {
		const isSelected = selected.some((study) => {
			return study.label === option.label;
		});

		if (isSelected) {
			onChange(
				selected.filter((study) => {
					return study.label !== option.label;
				})
			);
			return;
		}

		if (selected.length >= MAX_SELECTED_INDICATORS) {
			return;
		}
		onChange([...selected, option]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant='outline' size='sm'>
					Chart indicators ({selected.length}/
					{MAX_SELECTED_INDICATORS})
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-64 p-4'>
				<div className='flex flex-col gap-2'>
					{INDICATOR_OPTIONS.map((option) => {
						const isSelected = selected.some((study) => {
							return study.label === option.label;
						});
						return (
							// keyed by label: several options share a study id
							<label
								key={option.label}
								className='flex items-center gap-2'
							>
								<Checkbox
									checked={isSelected}
									disabled={
										!isSelected &&
										selected.length >=
											MAX_SELECTED_INDICATORS
									}
									onCheckedChange={() => {
										toggle(option);
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
