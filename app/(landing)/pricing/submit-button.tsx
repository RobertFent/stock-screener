'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { JSX } from 'react';
import { useFormStatus } from 'react-dom';

export function SubmitButton(): JSX.Element {
	const { pending } = useFormStatus();

	return (
		<Button
			type='submit'
			disabled={pending}
			className='w-full rounded-full'
		>
			{pending ? (
				<>
					<Loader2 className='animate-spin' />
					Loading…
				</>
			) : (
				<>
					Get started
					<ArrowRight />
				</>
			)}
		</Button>
	);
}
