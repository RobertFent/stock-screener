import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:size-3 [&>svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'border-primary/30 bg-primary/12 text-primary',
				neutral:
					'border-border-strong bg-surface-3 text-muted-foreground',
				outline: 'border-border-strong text-foreground',
				bullish: 'border-bullish/30 bg-bullish/12 text-bullish',
				bearish: 'border-bearish/30 bg-bearish/12 text-bearish',
				muted: 'border-transparent bg-surface-2 text-muted-foreground'
			},
			size: {
				default: 'px-2 py-0.5 text-xs',
				sm: 'px-1.5 py-0 text-[11px]'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

const Badge = ({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'span'> &
	VariantProps<typeof badgeVariants> & {
		asChild?: boolean;
	}): React.JSX.Element => {
	const Comp = asChild ? Slot : 'span';

	return (
		<Comp
			data-slot='badge'
			className={cn(badgeVariants({ variant, size }), className)}
			{...props}
		/>
	);
};

export { Badge, badgeVariants };
