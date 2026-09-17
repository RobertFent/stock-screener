import { JSX } from 'react';

import { cn } from '@/lib/utils';

/**
 * Original brand mark: a stylised candlestick trio inside a rounded square.
 * Uses `currentColor` so it inherits the surrounding text colour.
 */
export const BrandMark = ({
	className
}: {
	className?: string;
}): JSX.Element => {
	return (
		<svg
			viewBox='0 0 32 32'
			fill='none'
			role='img'
			aria-label='Stock Screener'
			className={cn('size-7', className)}
		>
			<rect
				x='1'
				y='1'
				width='30'
				height='30'
				rx='9'
				className='fill-primary/12 stroke-primary/40'
				strokeWidth='1.5'
			/>
			<g className='stroke-primary' strokeWidth='2' strokeLinecap='round'>
				<path d='M9 9v14' />
				<path d='M16 6v20' />
				<path d='M23 12v11' />
			</g>
			<g className='fill-primary'>
				<rect x='7' y='13' width='4' height='7' rx='1.2' />
				<rect x='14' y='9' width='4' height='9' rx='1.2' />
				<rect x='21' y='15' width='4' height='5' rx='1.2' />
			</g>
		</svg>
	);
};

export const BrandWordmark = ({
	className
}: {
	className?: string;
}): JSX.Element => {
	return (
		<span className={cn('flex items-center gap-2', className)}>
			<BrandMark />
			<span className='text-[15px] font-semibold tracking-tight'>
				Stock Screener
			</span>
		</span>
	);
};
