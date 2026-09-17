import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SubmitButton } from './submit-button';
import { JSX } from 'react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { checkoutAction } from '@/lib/payments/actions';
import Link from 'next/link';
import { cacheTag, cacheLife } from 'next/cache';
import { StripePrice, StripeProduct } from '@/lib/definitions/stripe';

// prices are fresh for one hour max
const getPricingData = async (): Promise<{
	prices: StripePrice[];
	products: StripeProduct[];
}> => {
	'use cache';
	cacheTag('stripe-pricing');
	cacheLife('hours'); // 1 hour TTL

	const [prices, products] = await Promise.all([
		getStripePrices(),
		getStripeProducts()
	]);

	return { prices, products };
};

export default async function PricingPage(): Promise<JSX.Element> {
	const { prices, products } = await getPricingData();

	const basePlan = products.find((product) => {
		return product.name === 'Base';
	});
	// const plusPlan = products.find((product) => {
	// 	return product.name === 'Plus';
	// });

	const basePrice = prices.find((price) => {
		return price.productId === basePlan?.id;
	});
	// const plusPrice = prices.find((price) => {
	// 	return price.productId === plusPlan?.id;
	// });

	return (
		<main className='mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8'>
			<div className='mx-auto mb-12 max-w-2xl text-center'>
				<h1 className='text-3xl font-bold tracking-tight text-balance sm:text-4xl'>
					Simple pricing that scales with your desk
				</h1>
				<p className='text-muted-foreground mt-4 text-lg'>
					Start free. Upgrade when you need more presets or a bigger
					team.
				</p>
			</div>
			<div className='mx-auto grid max-w-2xl gap-6 md:grid-cols-2'>
				<PricingCard
					name={'Free'}
					price={0}
					interval={'life time'}
					features={[
						'Up to 3 saved filter presets',
						'Up to 3 workspace members'
					]}
					routesToLogin={true}
				/>
				<PricingCard
					name={basePlan?.name || 'Base'}
					price={basePrice?.unitAmount || 800}
					interval={basePrice?.interval || 'month'}
					trialDays={basePrice?.trialPeriodDays || 7}
					features={[
						'Up to 10 saved filter presets',
						'Unlimited workspace members',
						'Email support'
					]}
					highlighted
					priceId={basePrice?.id}
				/>
				{/* <PricingCard
					name={plusPlan?.name || 'Plus'}
					price={plusPrice?.unitAmount || 1200}
					interval={plusPrice?.interval || 'month'}
					trialDays={plusPrice?.trialPeriodDays || 7}
					features={[
						'Everything in Base, and:',
						'Early Access to New Features',
						'24/7 Support + Slack Access'
					]}
					priceId={plusPrice?.id}
				/> */}
			</div>
		</main>
	);
}

const PricingCard = ({
	name,
	price,
	interval,
	trialDays,
	features,
	priceId,
	routesToLogin = false,
	highlighted = false
}: {
	name: string;
	price: number;
	interval: string;
	trialDays?: number;
	features: string[];
	priceId?: string;
	routesToLogin?: boolean;
	highlighted?: boolean;
}): JSX.Element => {
	return (
		<div
			className={`relative flex flex-col rounded-2xl border p-6 ${
				highlighted
					? 'border-primary/40 bg-surface-2 shadow-glow'
					: 'border-hairline bg-surface-1'
			}`}
		>
			{highlighted && (
				<Badge className='absolute -top-2.5 right-6'>
					Most popular
				</Badge>
			)}

			<div className='flex-1'>
				<h2 className='text-lg font-semibold'>{name}</h2>

				<p className='mt-4 flex items-baseline gap-1.5'>
					<span className='text-4xl font-semibold tabular'>
						${price / 100}
					</span>
					<span className='text-muted-foreground text-sm'>
						per user / {interval}
					</span>
				</p>

				<p className='text-muted-foreground mt-2 min-h-5 text-sm'>
					{trialDays ? `Includes a ${trialDays} day free trial` : ''}
				</p>

				<ul className='mt-6 mb-8 space-y-3'>
					{features.map((feature) => {
						return (
							<li
								key={feature}
								className='flex items-start gap-2'
							>
								<Check className='text-primary mt-0.5 size-4 shrink-0' />
								<span className='text-muted-foreground text-sm'>
									{feature}
								</span>
							</li>
						);
					})}
				</ul>
			</div>

			{routesToLogin ? (
				<Link href='/stock-screener' className='mt-auto block'>
					<SubmitButton />
				</Link>
			) : (
				<form action={checkoutAction} className='mt-auto'>
					<input type='hidden' name='priceId' value={priceId} />
					<SubmitButton />
				</form>
			)}
		</div>
	);
};
