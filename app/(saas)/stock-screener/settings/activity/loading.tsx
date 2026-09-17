import { JSX } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityPageSkeleton(): JSX.Element {
	return (
		<section>
			<h1 className='mb-6 text-2xl font-semibold tracking-tight'>
				Activity log
			</h1>
			<Card>
				<CardHeader>
					<CardTitle>Recent activity</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className='space-y-4'>
						{Array.from({ length: 5 }).map((_, index) => {
							return (
								<li
									key={index}
									className='flex items-center gap-3'
								>
									<Skeleton className='size-9 rounded-full' />
									<div className='space-y-2'>
										<Skeleton className='h-4 w-40' />
										<Skeleton className='h-3 w-20' />
									</div>
								</li>
							);
						})}
					</ul>
				</CardContent>
			</Card>
		</section>
	);
}
