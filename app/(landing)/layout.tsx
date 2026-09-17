'use client';

import Link from 'next/link';
import { JSX, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import {
	ClerkLoaded,
	ClerkLoading,
	SignedIn,
	SignedOut,
	SignInButton
} from '@clerk/nextjs';

import { BrandWordmark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const NAV_LINKS = [
	{ href: '/pricing', label: 'Pricing' },
	{ href: '/contact', label: 'Contact' },
	{ href: '/privacy-policy', label: 'Privacy' }
];

const ClerkMenu = (): JSX.Element => {
	return (
		<>
			<ClerkLoading>
				<Skeleton className='h-9 w-32 rounded-full' />
			</ClerkLoading>

			<ClerkLoaded>
				<SignedOut>
					<SignInButton forceRedirectUrl='/stock-screener'>
						<Button className='rounded-full'>Sign in</Button>
					</SignInButton>
				</SignedOut>

				<SignedIn>
					<Button asChild className='rounded-full'>
						<Link href='/stock-screener'>
							Open screener
							<ArrowRight />
						</Link>
					</Button>
				</SignedIn>
			</ClerkLoaded>
		</>
	);
};

const Header = (): JSX.Element => {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className='bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl'>
			<div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
				<Link
					href='/'
					className='hover:text-primary rounded-md transition-colors'
				>
					<BrandWordmark />
				</Link>

				<nav className='hidden items-center gap-1 md:flex'>
					{NAV_LINKS.map((link) => {
						return (
							<Link
								key={link.href}
								href={link.href}
								className='text-muted-foreground hover:bg-surface-1 hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors'
							>
								{link.label}
							</Link>
						);
					})}
				</nav>

				<div className='flex items-center gap-2'>
					<div className='hidden sm:block'>
						<ClerkMenu />
					</div>
					<Button
						variant='ghost'
						size='icon-sm'
						className='md:hidden'
						aria-label='Toggle navigation'
						aria-expanded={mobileOpen}
						onClick={() => {
							setMobileOpen((open) => {
								return !open;
							});
						}}
					>
						{mobileOpen ? <X /> : <Menu />}
					</Button>
				</div>
			</div>

			{mobileOpen && (
				<div className='flex flex-col gap-1 border-t p-3 md:hidden'>
					{NAV_LINKS.map((link) => {
						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => {
									setMobileOpen(false);
								}}
								className='text-muted-foreground hover:bg-surface-1 hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors'
							>
								{link.label}
							</Link>
						);
					})}
					<div className='pt-2 sm:hidden'>
						<ClerkMenu />
					</div>
				</div>
			)}
		</header>
	);
};

export default function LandingLayout({
	children
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			{children}
		</div>
	);
}
