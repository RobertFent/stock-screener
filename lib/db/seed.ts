/* eslint-disable no-console */
import dotenv from 'dotenv';
import Stripe from 'stripe';

// the other scripts get their environment from drizzle-kit / next; this one is
// a plain node script, so it has to load .env itself
dotenv.config();

type PlanDefinition = {
	name: string;
	description: string;
	unitAmountInCents: number;
	trialPeriodDays: number;
};

/** Plans the app expects to exist in Stripe. Add one here to seed it. */
const PLANS: readonly PlanDefinition[] = [
	{
		name: 'Base',
		description: 'Base subscription plan',
		unitAmountInCents: 499,
		trialPeriodDays: 7
	}
];

/**
 * Creates any missing Stripe product (and its monthly price). Existing products
 * are left untouched, so the script is safe to run repeatedly.
 */
const createStripeProducts = async (stripe: Stripe): Promise<void> => {
	console.log('Checking Stripe products and prices…');

	const existingProducts = (await stripe.products.list({ limit: 100 })).data;
	const existingProductNames = new Set(
		existingProducts.map((product) => {
			return product.name;
		})
	);

	const missingPlans = PLANS.filter((plan) => {
		return !existingProductNames.has(plan.name);
	});

	if (missingPlans.length === 0) {
		console.log('No Stripe products or prices needed to be created.');
		return;
	}

	for (const plan of missingPlans) {
		const product = await stripe.products.create({
			name: plan.name,
			description: plan.description
		});
		await stripe.prices.create({
			product: product.id,
			unit_amount: plan.unitAmountInCents,
			currency: 'usd',
			recurring: {
				interval: 'month',
				trial_period_days: plan.trialPeriodDays
			}
		});
		console.log(`Created Stripe product and price for '${plan.name}'.`);
	}
};

const seed = async (): Promise<void> => {
	const apiKey = process.env.STRIPE_SECRET_KEY;
	if (!apiKey) {
		throw new Error(
			'STRIPE_SECRET_KEY is not set. Copy .env.example to .env and fill in your Stripe test key, or run pnpm db:setup.'
		);
	}

	const stripe = new Stripe(apiKey, { apiVersion: '2025-12-15.clover' });
	await createStripeProducts(stripe);
};

seed()
	.then(() => {
		console.log('Seed process finished.');
		process.exit(0);
	})
	.catch((error) => {
		console.error(
			'Seed process failed:',
			error instanceof Error ? error.message : error
		);
		process.exit(1);
	});
