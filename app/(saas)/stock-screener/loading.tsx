import { JSX } from 'react';

const Block = ({ className }: { className: string }): JSX.Element => {
	return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
};

export default function StockScreenerSkeleton(): JSX.Element {
	return (
		<div className='flex flex-col gap-4 p-4'>
			{/* filter panel */}
			<div className='w-full rounded-xl border bg-card p-4 shadow-sm'>
				<div className='flex flex-wrap items-center gap-2'>
					<Block className='h-9 w-[250px]' />
					<Block className='h-9 w-32' />
					<Block className='h-9 w-24' />
				</div>
				<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6'>
					{Array.from({ length: 12 }).map((_, index) => {
						return <Block key={index} className='h-14 w-full' />;
					})}
				</div>
				<div className='mt-6 flex flex-wrap gap-4'>
					{Array.from({ length: 5 }).map((_, index) => {
						return <Block key={index} className='h-6 w-48' />;
					})}
				</div>
			</div>

			{/* results and chart */}
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,1fr)_2.2fr]'>
				<div className='rounded-xl border bg-card p-3 shadow-sm'>
					<Block className='mb-3 h-8 w-full' />
					{Array.from({ length: 12 }).map((_, index) => {
						return (
							<Block key={index} className='mb-2 h-7 w-full' />
						);
					})}
				</div>
				<div className='flex flex-col gap-4'>
					<Block className='h-8 w-40' />
					<Block className='h-[45vh] w-full' />
					<Block className='h-40 w-full' />
				</div>
			</div>
		</div>
	);
}
