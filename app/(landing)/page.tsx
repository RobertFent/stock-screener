import { JSX } from 'react';
import Link from 'next/link';
import {
	ArrowRight,
	ChartArea,
	Check,
	Database,
	Share2,
	Sparkles,
	UserCheck
} from 'lucide-react';

import { BrandMark } from '@/components/brand-mark';
import { HeroPreview } from '@/components/landing/hero-preview';
import {
	ChartPreview,
	FilterPreview,
	ResultsPreview
} from '@/components/landing/step-previews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FEATURES = [
	{
		icon: Database,
		title: 'Comprehensive stock data',
		description:
			'Analyse and filter Nasdaq and S&P 500 stocks using a rich dataset, including the key technical calculations you already trade with.'
	},
	{
		icon: UserCheck,
		title: 'Powerful technical filters',
		description:
			'Screen by price, volume, ADR%, RSI(4/14), Williams %R(4/14), IV, stochastics, MACD and EMA20/EMA50 crossovers — and save the combinations you rely on.'
	},
	{
		icon: ChartArea,
		title: 'Interactive charting',
		description:
			'Every match opens on a TradingView chart with your own indicator set, so you can confirm a setup without leaving the screen.'
	}
];

const STEPS = [
	{
		title: 'Choose your filter',
		body: 'Start by selecting or creating a filter preset. Narrow the market down to the indicator and momentum thresholds your strategy needs. Presets are saved per team, and one can be marked as your default.',
		preview: FilterPreview
	},
	{
		title: 'Pick the indicators on the chart',
		body: 'Add only the indicators you actually trade with — RSI, MACD, moving averages or stochastics — to keep the chart readable. Up to three at a time, remembered between visits.',
		preview: ChartPreview
	},
	{
		title: 'Scan the matches and share them',
		body: 'Sort the matches on any metric, step through them with the arrow keys, and send a filtered view to a colleague as a link. Teams share their saved presets; owners invite and remove members.',
		preview: ResultsPreview
	}
];

const Hero = (): JSX.Element => {
	return (
		<section className='relative overflow-hidden'>
			<div
				aria-hidden
				className='bg-grid pointer-events-none absolute inset-0 -z-10'
			/>
			<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
				<div className='lg:grid lg:grid-cols-12 lg:gap-12'>
					<div className='lg:col-span-6 lg:self-center'>
						<Badge className='mb-6'>
							<Sparkles />
							Nasdaq 100 · S&amp;P 100 · S&amp;P 500
						</Badge>

						<h1 className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]'>
							Find the setups that match
							<span className='text-gradient-brand'>
								{' '}
								your plan
							</span>
							, not the noise.
						</h1>

						<p className='text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed'>
							Screen hundreds of US large caps against the
							indicators you actually trade — RSI, Williams %R,
							IV, stochastics, MACD and moving average structure —
							then confirm each candidate on an interactive chart.
						</p>

						<div className='mt-8 flex flex-wrap items-center gap-3'>
							<Button asChild size='lg' className='rounded-full'>
								<Link href='/stock-screener'>
									Try it now
									<ArrowRight />
								</Link>
							</Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='rounded-full'
							>
								<Link href='/pricing'>See pricing</Link>
							</Button>
						</div>

						<p className='text-muted-foreground mt-4 flex items-center gap-2 text-sm'>
							<Check className='text-primary size-4 shrink-0' />
							Free to start — 3 saved presets, up to 3 team
							members, no card required.
						</p>

						<dl className='border-hairline mt-10 grid max-w-lg grid-cols-3 gap-6 border-t pt-6'>
							{[
								{ value: '3', label: 'Indices covered' },
								{ value: '14', label: 'Filter criteria' },
								{ value: 'Daily', label: 'Data refresh' }
							].map((stat) => {
								return (
									<div key={stat.label}>
										<dt className='text-muted-foreground text-xs tracking-wide uppercase'>
											{stat.label}
										</dt>
										<dd className='mt-1 text-2xl font-semibold tabular'>
											{stat.value}
										</dd>
									</div>
								);
							})}
						</dl>
					</div>

					<div className='mt-12 lg:col-span-6 lg:mt-0 lg:self-center'>
						<HeroPreview />
					</div>
				</div>
			</div>
		</section>
	);
};

const Features = (): JSX.Element => {
	return (
		<section className='border-hairline border-y'>
			<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<div className='grid gap-6 lg:grid-cols-3'>
					{FEATURES.map((feature) => {
						return (
							<div
								key={feature.title}
								className='border-hairline bg-surface-1 hover:border-primary/30 hover:bg-surface-2 group rounded-xl border p-6 transition-colors'
							>
								<div className='bg-primary/12 text-primary ring-primary/20 flex size-11 items-center justify-center rounded-lg ring-1'>
									<feature.icon className='size-5' />
								</div>
								<h2 className='mt-5 text-lg font-semibold'>
									{feature.title}
								</h2>
								<p className='text-muted-foreground mt-2 leading-relaxed'>
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

const Steps = (): JSX.Element => {
	return (
		<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
			<div className='max-w-2xl'>
				<Badge variant='neutral'>Workflow</Badge>
				<h2 className='mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl'>
					How to use this tool in your daily trading
				</h2>
			</div>

			<div className='mt-14 space-y-16 md:space-y-24'>
				{STEPS.map((step, index) => {
					const reversed = index % 2 === 1;
					return (
						<div
							key={step.title}
							className='grid items-center gap-8 lg:grid-cols-2 lg:gap-14'
						>
							<div className={reversed ? 'lg:order-2' : ''}>
								<div className='mb-4 flex items-center gap-3'>
									<span className='bg-primary/12 text-primary ring-primary/25 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 tabular'>
										{index + 1}
									</span>
									<h3 className='text-xl font-semibold'>
										{step.title}
									</h3>
								</div>
								<p className='text-muted-foreground max-w-xl text-lg leading-relaxed'>
									{step.body}
								</p>
							</div>

							<div className={reversed ? 'lg:order-1' : ''}>
								<step.preview />
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

const CallToAction = (): JSX.Element => {
	return (
		<section className='mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8'>
			<div className='border-primary/20 from-surface-2 to-surface-1 relative overflow-hidden rounded-2xl border bg-gradient-to-br px-6 py-14 text-center sm:px-12'>
				<div
					aria-hidden
					className='bg-primary/10 pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full blur-3xl'
				/>
				<BrandMark className='mx-auto size-10' />
				<h2 className='mt-5 text-2xl font-bold tracking-tight text-balance sm:text-3xl'>
					Validate the setup, then trade it
				</h2>
				<p className='text-muted-foreground mx-auto mt-3 max-w-xl text-lg'>
					Review the chart, confirm the conditions, and if everything
					lines up with your strategy, execute.
				</p>
				<p className='text-muted-foreground/80 mt-2 text-sm'>
					Free tier, no card required. Upgrade only when you outgrow
					three presets.
				</p>
				<Button asChild size='lg' className='mt-8 rounded-full'>
					<Link href='/stock-screener'>
						Start screening
						<ArrowRight />
					</Link>
				</Button>
			</div>
		</section>
	);
};

const Footer = (): JSX.Element => {
	const sections = [
		{
			title: 'Product',
			links: [
				{ href: '/stock-screener', label: 'Stock Screener' },
				{ href: '/pricing', label: 'Pricing' }
			]
		},
		{
			title: 'Company',
			links: [{ href: '/contact', label: 'Contact' }]
		},
		{
			title: 'Legal',
			links: [{ href: '/privacy-policy', label: 'Privacy Policy' }]
		}
	];

	return (
		<footer className='border-hairline bg-surface-1 border-t'>
			<div className='mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-2 gap-10 md:grid-cols-5'>
					<div className='col-span-2'>
						<div className='flex items-center gap-2'>
							<BrandMark />
							<h3 className='font-semibold'>Stock Screener</h3>
						</div>
						<p className='text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed'>
							Technical stock screening for the S&amp;P 500 and
							Nasdaq 100. Filter hundreds of stocks on your own
							indicators in seconds.
						</p>
						<p className='text-muted-foreground mt-4 flex max-w-xs items-start gap-2 text-sm leading-relaxed'>
							<Share2 className='mt-0.5 size-4 shrink-0' />
							Every screen has its own link — send a filtered view
							straight to a colleague.
						</p>
					</div>

					{sections.map((section) => {
						return (
							<div key={section.title}>
								<h4 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
									{section.title}
								</h4>
								<ul className='mt-4 space-y-3 text-sm'>
									{section.links.map((link) => {
										return (
											<li key={link.href}>
												<Link
													href={link.href}
													className='text-muted-foreground hover:text-primary transition-colors'
												>
													{link.label}
												</Link>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}
				</div>

				<div className='border-hairline text-muted-foreground mt-12 flex flex-col items-center justify-between gap-3 border-t pt-8 text-sm sm:flex-row'>
					<p>Stock Screener by Robert Fent</p>
					<p>
						Market data provided for informational purposes only.
						Not financial advice.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default function HomePage(): JSX.Element {
	return (
		<main className='flex-1'>
			<Hero />
			<Features />
			<Steps />
			<CallToAction />
			<Footer />
		</main>
	);
}
