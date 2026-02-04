'use client';

import Link from 'next/link';
import { JSX } from 'react';
import { CircleIcon } from 'lucide-react';
import { RedirectToSignIn, SignedOut, UserButton } from '@clerk/nextjs';

const Header = (): JSX.Element => {
	return (
		<header className='border-b px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center overflow-auto'>
			{/* left items */}
			<Link href='/stock-screener' className='flex items-center'>
				<CircleIcon className='h-6 w-6 text-primary' />
				<span className='ml-2 text-xl font-semibold'>
					Stock Screener
				</span>
			</Link>
			{/* right items */}
			<div className='flex items-center space-x-4'>
				<Link
					href='/stock-screener'
					className='hidden sm:flex items-center'
				>
					<span className='ml-4 text-xl font-semibold'>
						Stock Screener
					</span>
				</Link>
				<Link
					href='/stock-screener/settings'
					className='flex items-center'
				>
					<span className='ml-4 text-xl font-semibold'>Settings</span>
				</Link>
				<UserButton />
			</div>
		</header>
	);
};

export default function SaaSLayout({
	children
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
			<section className='flex flex-col min-h-screen'>
				<Header />
				{children}
			</section>
		</>
	);
}
