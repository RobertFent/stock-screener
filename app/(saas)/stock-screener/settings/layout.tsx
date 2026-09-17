'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Contact, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
	{ href: '/stock-screener/settings', icon: Users, label: 'Team' },
	{
		href: '/stock-screener/settings/activity',
		icon: Activity,
		label: 'Activity'
	},
	{
		href: '/stock-screener/settings/contact',
		icon: Contact,
		label: 'Contact'
	}
];

export default function SettingsLayout({
	children
}: {
	children: React.ReactNode;
}): JSX.Element {
	const pathname = usePathname();

	return (
		<div className='mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8'>
			<div className='flex flex-col gap-6 lg:flex-row lg:gap-10'>
				{/*
				 * Horizontally scrollable tabs on small screens, a rail on
				 * large ones. This replaces the old off-canvas drawer, which
				 * needed a toggle button and could leave the page in a state
				 * where the nav was unreachable.
				 */}
				<nav
					aria-label='Settings'
					className='scrollbar-slim -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:w-52 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0'
				>
					{NAV_ITEMS.map((item) => {
						const active = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								aria-current={active ? 'page' : undefined}
								className={cn(
									'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
									active
										? 'bg-surface-2 text-foreground'
										: 'text-muted-foreground hover:bg-surface-1 hover:text-foreground'
								)}
							>
								<item.icon className='size-4' />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<main className='min-w-0 flex-1'>{children}</main>
			</div>
		</div>
	);
}
