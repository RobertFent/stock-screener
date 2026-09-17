import Link from 'next/link';
import { JSX } from 'react';
import { ArrowLeft } from 'lucide-react';

import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';

export default function NotFound(): JSX.Element {
	return (
		<div className='flex min-h-[100dvh] items-center justify-center px-4'>
			<div className='max-w-md space-y-6 text-center'>
				<BrandMark className='mx-auto size-12' />
				<p className='text-primary text-sm font-semibold tracking-[0.2em] uppercase'>
					404
				</p>
				<h1 className='text-3xl font-bold tracking-tight text-balance'>
					Page not found
				</h1>
				<p className='text-muted-foreground'>
					The page you are looking for might have been removed, had
					its name changed, or is temporarily unavailable.
				</p>
				<Button asChild variant='outline' className='rounded-full'>
					<Link href='/'>
						<ArrowLeft />
						Back to home
					</Link>
				</Button>
			</div>
		</div>
	);
}
