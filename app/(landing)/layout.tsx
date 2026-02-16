'use client';

import Link from 'next/link';
import { JSX } from 'react';
import { CircleIcon } from 'lucide-react';
import {
	ClerkLoaded,
	ClerkLoading,
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton
} from '@clerk/nextjs';

const ClerkMenu = (): JSX.Element => {
	return (
		<>
			<ClerkLoading>
				{/* Skeleton or placeholder */}
				<div className='rounded-full bg-primary h-12 px-5 w-22 animate-pulse' />
			</ClerkLoading>

			<ClerkLoaded>
				<SignedOut>
					<SignInButton forceRedirectUrl='/stock-screener'>
						<button className='bg-primary rounded-full font-medium text-xl sm:h-12 px-4 sm:px-5 cursor-pointer'>
							Sign In
						</button>
					</SignInButton>
				</SignedOut>

				<SignedIn>
					<Link
						href='/stock-screener'
						className='hidden sm:flex items-center'
					>
						<span className='md:text-xl font-semibold'>
							Stock Screener
						</span>
					</Link>
					<UserButton />
				</SignedIn>
			</ClerkLoaded>
		</>
	);
};

const Header = (): JSX.Element => {
	return (
		<header className='border-b px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center overflow-auto'>
			{/* left items */}
			<Link href='/stock-screener' className='flex items-center'>
				<CircleIcon className='h-6 w-6 text-primary' />
				<span className='ml-2 md:text-xl font-semibold'>
					Stock Screener
				</span>
			</Link>
			{/* right items */}
			<div className='flex items-center space-x-4'>
				<Link href='/pricing'>
					<span className='md:text-xl font-semibold'>Pricing</span>
				</Link>
				<Link href='/privacy-policy'>
					<span className='md:text-xl font-semibold text-nowrap'>
						Privacy Policy
					</span>
				</Link>
				{/* // todo: blog */}
				{/* <Link href='/blog'>
					<span className='sm:ml-2 text-xl font-semibold'>Blog</span>
				</Link> */}
				<ClerkMenu />
			</div>
		</header>
	);
};

export default function LandingLayout({
	children
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<section className='flex flex-col min-h-screen'>
			<Header />
			{children}
		</section>
	);
}
