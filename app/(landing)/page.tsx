import { Button } from '@/components/ui/button';
import { ArrowRight, Database, UserCheck, ChartArea } from 'lucide-react';
import { JSX } from 'react';
import Image from 'next/image';

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
						<div className='mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center'>
							<Image
								src='/images/stock_screener_example.png'
								alt='Example stock screener'
								width={400}
								height={300}
								className='w-full h-auto'
							/>
						</div>
					</div>
				</div>
			</section>

			<section className='py-12 bg-secondary w-full'>
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

			<section className='py-16'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center'>
						<div>
							<h2 className='text-2xl font-bold sm:text-3xl'>
								Ready to enhance your stock screening game?
							</h2>
							<p className='mt-3 max-w-3xl text-lg text-foreground/80'>
								Save some time with Stock Screener doing the
								heavy lifting and reveal the stocks that meet
								your exact strategy.
							</p>
						</div>
						<div className='mt-8 ml-10 lg:mt-0 flex flex-col gap-5 items-end'>
							<a href='/stock-screener'>
								<Button
									size='lg'
									variant='outline'
									className='text-lg rounded-full cursor-pointer'
								>
									Get Started
									<ArrowRight className='ml-3 h-6 w-6' />
								</Button>
							</a>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
