import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = ({
	className,
	type,
	...props
}: React.ComponentProps<'input'>): React.JSX.Element => {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(
				'bg-input border-border-strong text-foreground placeholder:text-muted-foreground/70 h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-elevation-1 transition-[border-color,box-shadow] outline-none',
				'selection:bg-primary/30',
				'hover:border-border-strong/80',
				'focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/25',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
				'aria-invalid:border-destructive aria-invalid:ring-destructive/25',
				className
			)}
			{...props}
		/>
	);
};

export { Input };
