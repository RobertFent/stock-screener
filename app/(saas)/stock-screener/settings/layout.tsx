'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Activity, Menu, Contact } from 'lucide-react';

export default function SettingsLayout({
	children
}: {
	children: React.ReactNode;
}): JSX.Element {
	const pathname = usePathname();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const navItems = [
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

	return (
		<div className='flex flex-col min-h-[calc(100dvh-68px)] mx-auto w-full'>
			{/* Mobile header */}
			<div className='lg:hidden flex items-center justify-between border-b p-4'>
				<div className='flex items-center'>
					<span className='font-medium'>Settings</span>
				</div>
				<Button
					className='-mr-3'
					variant='ghost'
					onClick={() => {
						return setIsSidebarOpen(!isSidebarOpen);
					}}
				>
					<Menu className='h-6 w-6' />
					<span className='sr-only'>Toggle sidebar</span>
				</Button>
			</div>

			<div className='flex flex-1 overflow-hidden h-full'>
				<div
					className={`flex w-full transition-transform duration-300 ease-in-out`}
				>
					{/* Sidebar */}
					<aside
						className={`w-64 border-r bg-background shrink-0 transition-[margin] duration-300 ease-in-out ${
							isSidebarOpen ? 'ml-0' : '-ml-64'
						} lg:ml-0`}
					>
						<nav className='h-full overflow-y-auto p-4'>
							{navItems.map((item) => {
								return (
									<Link
										key={item.href}
										href={item.href}
										passHref
									>
										<Button
											variant={
												pathname === item.href
													? 'secondary'
													: 'ghost'
											}
											className={`cursor-pointer shadow-none my-1 w-full justify-start ${
												pathname === item.href
													? 'bg-secondary'
													: ''
											}`}
											onClick={() => {
												return setIsSidebarOpen(false);
											}}
										>
											<item.icon className='h-4 w-4' />
											{item.label}
										</Button>
									</Link>
								);
							})}
						</nav>
					</aside>

					{/* Main content */}
					<main className='flex-1 overflow-y-auto p-0 lg:p-4'>
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}
