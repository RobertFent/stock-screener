import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SWRConfig } from 'swr';
import { JSX } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
	title: 'Stock Screener',
	description: 'Stock Screener for a few indicators'
};

export const viewport: Viewport = {
	maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<ClerkProvider>
			<html lang='en' className={`${manrope.className}`}>
				<body className='min-h-[100dvh]'>
					<SWRConfig
						value={{
							fallback: {
								// We do NOT await here
								// Only components that read this data will suspend
								// '/api/user': getCurrentAppUser(),
								// '/api/team': getTeamForUser()
							}
						}}
					>
						{children}
					</SWRConfig>
				</body>
			</html>
		</ClerkProvider>
	);
}
