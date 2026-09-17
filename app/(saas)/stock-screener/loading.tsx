import { JSX } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const GROUP_SPANS = ['lg:col-span-5', 'lg:col-span-2', 'lg:col-span-5'];

export default function StockScreenerSkeleton(): JSX.Element {
	return (
		<main className='mx-auto w-full max-w-[1920px] flex-1 p-3 sm:p-4'>
			<div className='flex flex-col gap-3 lg:h-[calc(100dvh-5.5rem)]'>
				{/* filter panel */}
				<div className='border-hairline bg-card rounded-xl border'>
					<div className='flex flex-wrap items-center gap-2 px-3 py-2.5'>
						<Skeleton className='h-8 w-56' />
						<Skeleton className='h-8 w-20' />
						<Skeleton className='h-8 w-20' />
						<Skeleton className='h-5 w-24 rounded-full' />
					</div>
					<div className='border-hairline grid gap-x-6 gap-y-5 border-t px-3 py-4 lg:grid-cols-12'>
						{GROUP_SPANS.map((span, group) => {
							return (
								<div
									key={span + group}
									className={`${span} flex flex-col gap-2`}
								>
									<Skeleton className='h-3 w-20' />
									<div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
										{Array.from({ length: 4 }).map(
											(_, field) => {
												return (
													<Skeleton
														key={field}
														className='h-[52px] w-full'
													/>
												);
											}
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* results and chart */}
				<div className='grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(300px,24%)_1fr]'>
					<div className='border-hairline bg-card flex max-h-[55vh] flex-col gap-2 rounded-xl border p-3 lg:max-h-none'>
						<Skeleton className='h-8 w-full' />
						{Array.from({ length: 14 }).map((_, row) => {
							return (
								<Skeleton key={row} className='h-6 w-full' />
							);
						})}
					</div>
					<div className='flex min-h-0 flex-col gap-3'>
						<Skeleton className='h-14 w-full rounded-xl' />
						<Skeleton className='min-h-[320px] flex-1 rounded-xl' />
						<Skeleton className='h-28 w-full rounded-xl' />
					</div>
				</div>
			</div>
		</main>
	);
}
