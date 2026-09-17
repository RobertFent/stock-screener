import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	[
		'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md',
		'text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150',
		'outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		'disabled:pointer-events-none disabled:opacity-45',
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		'active:translate-y-px'
	].join(' '),
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-elevation-1 hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-elevation-1 hover:bg-destructive/90 focus-visible:ring-destructive/50',
				outline:
					'border border-border-strong bg-surface-1 text-foreground hover:border-border-strong hover:bg-surface-2',
				secondary:
					'bg-surface-2 text-secondary-foreground hover:bg-surface-3',
				ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				// quiet icon action inside dense rows and popovers
				subtle: 'text-muted-foreground hover:bg-surface-3 hover:text-foreground'
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
				xs: 'h-7 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5',
				lg: 'h-11 rounded-lg px-6 text-base has-[>svg]:px-5',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-xs': 'size-7',
				'icon-lg': 'size-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

const Button = ({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}): React.JSX.Element => {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot='button'
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
};

export { Button, buttonVariants };
