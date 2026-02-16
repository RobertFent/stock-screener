import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JSX } from 'react';

export default function PrivacyPolicy(): JSX.Element {
	return (
		<div className='min-h-screen mt-2 md:mt-8 px-2 md:px-8'>
			<div className='mx-auto max-w-7xl'>
				<Card>
					<CardHeader>
						<CardTitle>Privacy Policy</CardTitle>
						<p className='text-sm text-muted-foreground'>
							Last updated: 16 February 2026
						</p>
					</CardHeader>
					<CardContent>
						<article
							className='mt-4 md:mt-8 space-y-4 text-foreground
										[&>h2]:mt-12 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight
										[&>h3]:mt-6 [&>h3]:text-base [&>h3]:font-semibold
										[&>p]:text-muted-foreground
										[&>ul]:ml-6 [&>ul]:list-disc [&>ul]:space-y-2
										[&>ul>li]:text-muted-foreground'
						>
							<p>
								This Privacy Policy explains how{' '}
								<strong>stock-screener.app</strong> (“we”, “us”,
								“our”) processes personal data when you use our
								website and SaaS application.
							</p>

							<h2>1. Data Controller</h2>
							<p>
								The data controller under the EU General Data
								Protection Regulation (GDPR) is:
							</p>
							<ul>
								<li>
									<strong>Operator:</strong> Robert Fent
								</li>
								<li>
									<strong>Country:</strong> Germany
								</li>
								<li>
									<strong>Contact:</strong>{' '}
									info@robertfent.com
								</li>
							</ul>

							<h2>2. What data we collect</h2>

							<h3>2.1 Account data</h3>
							<p>
								When you create an account, we process your
								email address, user ID, and authentication data.
								Authentication is handled by{' '}
								<strong>Clerk</strong>.
							</p>

							<h3>2.2 Usage data</h3>
							<p>
								We collect limited usage data such as pages
								visited, features used, and error information.
								This data is processed via{' '}
								<strong>PostHog</strong> in a first-party,
								cookie-less configuration. We do not track users
								across websites and do not use advertising or
								profiling.
							</p>

							<h3>2.3 Payment data</h3>
							<p>
								If you purchase a subscription, payments are
								processed by <strong>Stripe</strong>. We do not
								store payment card details. We only receive
								subscription and payment status.
							</p>

							<h3>2.4 Technical & security data</h3>
							<p>
								For security and reliability, we process IP
								address, device information, and request logs
								via <strong>Cloudflare</strong> and{' '}
								<strong>Vercel</strong>.
							</p>

							<h2>3. Cookies & local storage</h2>
							<p>
								We use only strictly necessary cookies and local
								storage for login, security, and first-party
								analytics. We do not use advertising, marketing,
								or cross-site tracking cookies.
							</p>

							<h2>4. Legal basis</h2>
							<ul>
								<li>
									Accounts & subscriptions: Art. 6(1)(b) GDPR
									(contract)
								</li>
								<li>
									Security & abuse prevention: Art. 6(1)(f)
									GDPR (legitimate interest)
								</li>
								<li>
									Analytics & service improvement: Art.
									6(1)(f) GDPR (legitimate interest)
								</li>
							</ul>

							<h2>5. Data processors</h2>
							<ul>
								<li>Clerk — Authentication</li>
								<li>Stripe — Payments</li>
								<li>PostHog — Analytics</li>
								<li>Cloudflare — Security</li>
								<li>Vercel — Hosting</li>
							</ul>

							<p>
								Data may be processed outside the EU under
								GDPR-approved safeguards such as Standard
								Contractual Clauses.
							</p>

							<h2>6. Data retention</h2>
							<p>
								Account data is kept until you delete your
								account. Billing data is stored as required by
								law. Security and analytics data is retained
								only as long as necessary.
							</p>

							<h2>7. Your rights</h2>
							<p>
								You have the right to access, correct, delete,
								restrict, object to processing, receive a copy
								of your data, and lodge a complaint with a data
								protection authority.
							</p>

							<h2>8. Account deletion</h2>
							<p>
								You can delete your account at any time.
								Personal data will be removed unless legal
								retention obligations apply.
							</p>

							<h2>9. Changes</h2>
							<p>
								We may update this Privacy Policy. The current
								version is always available on this page.
							</p>
						</article>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
