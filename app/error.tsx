'use client';

import { JSX, useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatError } from '@/lib/formatters';
import { logger } from '@/lib/logger';

const log = logger.child({ side: 'client', module: 'global-error' });

const Error = ({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}): JSX.Element => {
	useEffect(() => {
		log.error(error);
	}, [error]);

	return (
		<div className='flex min-h-[60dvh] items-center justify-center px-4 py-16'>
			<div className='border-hairline bg-card shadow-elevation-2 w-full max-w-md space-y-5 rounded-2xl border p-8 text-center'>
				<div className='bg-destructive/12 text-destructive ring-destructive/20 mx-auto flex size-12 items-center justify-center rounded-full ring-1'>
					<AlertTriangle className='size-6' />
				</div>
				<h1 className='text-xl font-semibold tracking-tight'>
					Something went wrong
				</h1>
				<p className='text-muted-foreground bg-surface-2 rounded-md px-3 py-2 text-sm break-words'>
					{formatError(error)}
				</p>
				{error.digest && (
					<p className='text-muted-foreground/70 text-xs'>
						Reference: {error.digest}
					</p>
				)}
				<Button
					variant='outline'
					className='rounded-full'
					onClick={reset}
				>
					<RotateCcw />
					Try again
				</Button>
			</div>
		</div>
	);
};

export default Error;
