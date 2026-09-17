'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { RedirectToSignIn, SignedOut, UserButton } from '@clerk/nextjs';

import { BrandWordmark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
	{ href: '/stock-screener', label: 'Screener' },
	{ href: '/stock-screener/settings', label: 'Settings' }
];

const isActive = (pathname: string, href: string): boolean => {
	return href === '/stock-screener'
		? pathname === href
		: pathname.startsWith(href);
};

const Header = (): JSX.Element => {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className='bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl'>
			<div className='flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center gap-6'>
					<Link
						href='/stock-screener'
						className='hover:text-primary rounded-md transition-colors'
					>
						<BrandWordmark />
					</Link>

					<nav className='hidden items-center gap-1 sm:flex'>
						{NAV_ITEMS.map((item) => {
							const active = isActive(pathname, item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? 'page' : undefined}
									className={cn(
										'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
										active
											? 'bg-surface-2 text-foreground'
											: 'text-muted-foreground hover:bg-surface-1 hover:text-foreground'
									)}
								>
									{item.label}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className='flex items-center gap-2'>
					<UserButton />
					<Button
						variant='ghost'
						size='icon-sm'
						className='sm:hidden'
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
				<nav className='flex flex-col gap-1 border-t p-2 sm:hidden'>
					{NAV_ITEMS.map((item) => {
						const active = isActive(pathname, item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => {
									setMobileOpen(false);
								}}
								className={cn(
									'rounded-md px-3 py-2 text-sm font-medium transition-colors',
									active
										? 'bg-surface-2 text-foreground'
										: 'text-muted-foreground hover:bg-surface-1 hover:text-foreground'
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>
			)}
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
			<div className='flex min-h-screen flex-col'>
				<Header />
				{children}
			</div>
		</>
	);
}
