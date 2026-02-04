import { Card, CardContent } from '@/components/ui/card';
import { JSX } from 'react';

export default function StockScreenerSkeleton(): JSX.Element {
	return (
		<div className='p-2'>
			{/* filter bar */}
			<Card className='w-full shadow-2xl rounded-2xl animate-pulse bg-card/80 backdrop-blur-sm'>
				<CardContent className='space-y-6'>
					<div className='h-6 w-40 bg-muted rounded' />

					<div className='space-y-4'>
						<div className='h-8 w-full bg-muted rounded mb-6' />
						<div className='h-8 w-full bg-muted rounded mb-6' />
						<div className='h-8 w-full bg-muted rounded' />
					</div>
				</CardContent>
			</Card>
			{/* stock box left */}
			<Card className='sm:w-1/4 shadow-2xl rounded-2xl animate-pulse bg-card/80 backdrop-blur-sm mt-8 h-[70vh]'>
				<CardContent className='space-y-6'>
					<div className='h-6 w-40 bg-muted rounded' />

					<div className='space-y-4'>
						<div className='h-8 w-full bg-muted rounded mb-6' />
						<div className='h-8 w-full bg-muted rounded mb-6' />
						<div className='h-8 w-full bg-muted rounded mb-6' />
						<div className='h-8 w-full bg-muted rounded mb-6' />
						<div className='h-8 w-full bg-muted rounded' />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
