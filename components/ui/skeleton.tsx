import * as React from 'react';

import { cn } from '@/lib/utils';

/** Neutral loading placeholder; matches the surface ladder in globals.css. */
const Skeleton = ({
	className,
	...props
}: React.ComponentProps<'div'>): React.JSX.Element => {
	return (
		<div
			data-slot='skeleton'
			className={cn('bg-surface-2 animate-pulse rounded-md', className)}
			{...props}
		/>
	);
};

export { Skeleton };
