/* eslint-disable no-console */
import Stripe from 'stripe';

/**
 * Inits admin user with test team assigned
 */
const seed = async (): Promise<void> => {
	await createStripeProducts();
};

/**
 * Creates default base and plus product
 */
const createStripeProducts = async (): Promise<void> => {
	console.log('Creating Stripe products and prices...');
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
		apiVersion: '2025-04-30.basil'
	});

	const baseProduct = await stripe.products.create({
		name: 'Base',
		description: 'Base subscription plan'
	});

	await stripe.prices.create({
		product: baseProduct.id,
		unit_amount: 800, // $8 in cents
		currency: 'usd',
		recurring: {
			interval: 'month',
			trial_period_days: 7
		}
	});

	const plusProduct = await stripe.products.create({
		name: 'Plus',
		description: 'Plus subscription plan'
	});

	await stripe.prices.create({
		product: plusProduct.id,
		unit_amount: 1200, // $12 in cents
		currency: 'usd',
		recurring: {
			interval: 'month',
			trial_period_days: 7
		}
	});

	console.log('Stripe products and prices created successfully.');
};

seed()
	.catch((error) => {
		console.error('Seed process failed:', error);
		process.exit(1);
	})
	.finally(() => {
		console.log('Seed process finished. Exiting...');
		process.exit(0);
	});
