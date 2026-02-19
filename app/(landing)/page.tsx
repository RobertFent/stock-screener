import { Button } from '@/components/ui/button';
import { ArrowRight, Database, UserCheck, ChartArea } from 'lucide-react';
import { JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FeatureElement = (
	icon: JSX.Element,
	title: string,
	description: string
): JSX.Element => {
	return (
		<div className='mt-10 lg:mt-0'>
			<div className='flex items-center justify-center h-12 w-12 rounded-md bg-primary'>
				{icon}
			</div>
			<div className='mt-5'>
				<h2 className='text-lg font-medium text-secondary-foreground'>
					{title}
				</h2>
				<p className='mt-2 text-base text-secondary-foreground/80'>
					{description}
				</p>
			</div>
		</div>
	);
};

const Footer = (): JSX.Element => {
	return (
		<footer className='border-t bg-background'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
					{/* Brand */}
					<div>
						<h3 className='text-lg font-semibold'>
							Stock Screener
						</h3>
						<p className='mt-4 text-sm text-muted-foreground max-w-xs'>
							Advanced technical stock screening for S&P 500 &
							Nasdaq 100 stocks. Filter hundreds of stocks based
							on your favorite indicators in seconds.
						</p>
					</div>

					{/* Product */}
					<div>
						<h4 className='text-sm font-semibold tracking-wide uppercase text-muted-foreground'>
							Product
						</h4>
						<ul className='mt-4 space-y-3 text-sm'>
							<li>
								<Link
									href='/stock-screener'
									className='hover:text-primary transition'
								>
									Stock Screener
								</Link>
							</li>
							<li>
								<Link
									href='/pricing'
									className='hover:text-primary transition'
								>
									Pricing
								</Link>
							</li>
							{/* // todo */}
							{/* <li>
								<Link
									href='/features'
									className='hover:text-primary transition'
								>
									Features
								</Link>
							</li> */}
						</ul>
					</div>

					{/* Company */}
					{/* // todo */}
					<div>
						<h4 className='text-sm font-semibold tracking-wide uppercase text-muted-foreground'>
							Company
						</h4>
						<ul className='mt-4 space-y-3 text-sm'>
							{/* <li>
								<Link
									href='/about'
									className='hover:text-primary transition'
								>
									About
								</Link>
							</li> */}
							<li>
								<Link
									href='/contact'
									className='hover:text-primary transition'
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h4 className='text-sm font-semibold tracking-wide uppercase text-muted-foreground'>
							Legal
						</h4>
						<ul className='mt-4 space-y-3 text-sm'>
							<li>
								<Link
									href='/privacy-policy'
									className='hover:text-primary transition'
								>
									Privacy Policy
								</Link>
							</li>
							{/* // todo */}
							{/* <li>
								<Link
									href='/terms'
									className='hover:text-primary transition'
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									href='/imprint'
									className='hover:text-primary transition'
								>
									Imprint
								</Link>
							</li> */}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className='mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground'>
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
		<main>
			<section className='py-10 sm:py-20'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='lg:grid lg:grid-cols-12 lg:gap-8'>
						<div className='sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left'>
							<h1 className='text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl'>
								Filter Nasdaq and S&P 500 Stocks with
								<span className='text-primary'>
									{' '}
									Stock Screener
								</span>
							</h1>
							<p className='mt-3 text-base text-foreground/80 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl'>
								Discover stocks that match your strategy using a
								large dataset of Nasdaq and S&amp;P 500 data.
								Filter by RSI(4/14), Williams %R(4/14), IV,
								Stochastics, MACD, and EMA20/EMA50 crossovers.
								The results will be visualized on an interactive
								TradingView chart and you may additionaly choose
								which indicators to display.
							</p>
							<a href='/stock-screener'>
								<Button
									size='lg'
									className='mt-8 text-lg rounded-full cursor-pointer'
									variant='outline'
								>
									Try It Now
									<ArrowRight className='ml-3 h-6 w-6' />
								</Button>
							</a>
						</div>
						<div className='mt-12 sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center'>
							<video
								src='/videos/demo_16_02.mp4'
								controls
								autoPlay
								loop
								muted
								className='rounded-xl'
							>
								Your browser does not support the video tag.
							</video>
						</div>
					</div>
				</div>
			</section>

			<section className='py-6 md:py-12 bg-secondary w-full'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='lg:grid lg:grid-cols-3 lg:gap-8'>
						{FeatureElement(
							<Database className='h-6 w-6' />,
							'Comprehensive Stock Data',
							'Analyze and filter Nasdaq and S&P 500 stocks using a rich dataset, including some of the most common key technical calculations.'
						)}
						{FeatureElement(
							<UserCheck className='h-6 w-6' />,
							'Powerful Technical Filters',
							'Screen stocks by RSI(4/14), Williams %R(4/14), IV, Stochastics, MACD, and EMA20/EMA50 crossovers.'
						)}
						{FeatureElement(
							<ChartArea className='h-6 w-6' />,
							'Interactive Charting Experience',
							'Visualize filtered stocks on a TradingView chart and choose between a set of indicators to display for deeper analysis and confident decisions.'
						)}
					</div>
				</div>
			</section>

			<section className='py-12 md:py-16'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='max-w-3xl mb-12'>
						<h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
							How to use this tool for your daily trading
						</h2>
					</div>

					<div className='space-y-12 md:space-y-24'>
						{/* Step 1 */}
						<div className='grid lg:grid-cols-2 gap-6 md:gap-12 items-center'>
							<div>
								<div className='flex items-center gap-3 mb-4'>
									<span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold'>
										1
									</span>
									<h3 className='text-xl font-semibold'>
										Choose your filter
									</h3>
								</div>

								<p className='text-lg text-foreground/70 max-w-xl'>
									Start by selecting or creating a filter
									preset. This lets you narrow the market down
									by the indicator or momentum thresholds
									needed for your trading strategy. You can
									save up to three filter presets by default.
									Once a filter is saved you can use it,
									delete it or even set one as your default.
								</p>
							</div>

							<div className='relative rounded-xl border bg-background p-2 shadow-lg'>
								<Image
									src='/images/select-filter.png'
									alt='Selecting a stock filter'
									width={800}
									height={600}
									className='rounded-lg'
								/>
							</div>
						</div>

						{/* Step 2 */}
						<div className='grid lg:grid-cols-2 gap-6 md:gap-12 items-center lg:grid-flow-col-dense'>
							<div className='lg:col-start-2'>
								<div className='flex items-center gap-3 mb-4'>
									<span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold'>
										2
									</span>
									<h3 className='text-xl font-semibold'>
										Pick indicators displayed on the chart
									</h3>
								</div>

								<p className='text-lg text-foreground/70 max-w-xl'>
									Add only the indicators you actually trade
									with like RSI, MACD, moving averages, or
									Stochastic to keep the chart as clean as
									possible.
								</p>
								<p className='text-lg text-foreground/70 max-w-xl'>
									CAVEAT: due to technical limitations you may
									only choose 3 indicators at the same time
								</p>
							</div>

							<div className='relative rounded-xl border bg-background p-2 shadow-lg lg:col-start-1'>
								<Image
									src='/images/select-indicator.png'
									alt='Selecting indicators'
									width={800}
									height={600}
									className='rounded-lg'
								/>
							</div>
						</div>

						{/* Step 3 */}
						<div className='grid lg:grid-cols-2 gap-6 md:gap-12 items-center'>
							<div>
								<div className='flex items-center gap-3 mb-4'>
									<span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold'>
										3
									</span>
									<h3 className='text-xl font-semibold'>
										Optionally: Collaborate with your
										trading collegues
									</h3>
								</div>

								<p className='text-lg text-foreground/70 max-w-xl'>
									Being part of a team lets you share all
									saved filter presets. Owners can invite new
									members and remove non-owners, while members
									can simply use the shared filters.
								</p>
							</div>

							<div className='relative rounded-xl border bg-background p-2 shadow-lg'>
								<Image
									src='/images/invite-team-member.png'
									alt='Inviting a team member'
									width={800}
									height={400}
									className='rounded-lg'
								/>
							</div>
						</div>

						{/* Step 4 */}
						<div className='flex flex-col items-center text-center max-w-2xl mx-auto'>
							<div className='flex items-center gap-3 mb-4'>
								<span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold'>
									4
								</span>
								<h3 className='text-xl font-semibold'>
									Validate and trade
								</h3>
							</div>

							<p className='text-lg text-foreground/70'>
								Review the chart, confirm the setup, and if
								everything aligns with your strategy, execute
								the trade.
							</p>

							<a href='/stock-screener' className='mt-8'>
								<Button
									size='lg'
									className='text-lg rounded-full cursor-pointer'
								>
									Start screening
								</Button>
							</a>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</main>
	);
}
