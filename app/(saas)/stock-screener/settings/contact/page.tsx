'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, MapPin } from 'lucide-react';
import { JSX, useState } from 'react';

export default function ContactPage(): JSX.Element {
	const [isEmailSending, setIsEmailSending] = useState(false);
	const [emailSendSuccess, setEmailSendSuccess] = useState(false);
	const [emailAlreadySent, setEmailAlreadySent] = useState(false);

	// todo: is this the best approach?
	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault(); // prevents page reload
		setIsEmailSending(true);

		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get('name'),
			email: formData.get('email'),
			message: formData.get('message')
		};

		try {
			const response = await fetch('/api/resend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			setEmailSendSuccess(true);
			// e.currentTarget.reset(); // todo: verify
		} catch (_error) {
			setEmailSendSuccess(false);
		} finally {
			setIsEmailSending(false);
			setEmailAlreadySent(true);
		}
	};
	return (
		<section className='flex-1 p-4 lg:p-8'>
			<h1 className='text-lg lg:text-2xl font-medium mb-6'>Contact</h1>

			<div className='grid gap-8 md:grid-cols-2'>
				{/* Contact info */}
				<Card>
					<CardHeader>
						<CardTitle>Robert Fent</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6 text-sm'>
						<div className='flex items-center gap-3'>
							<Mail className='w-5 h-5 text-muted-foreground' />
							<div>
								<p className='font-medium'>Email</p>
								<p className='text-muted-foreground'>
									info@robertfent.com
								</p>
							</div>
						</div>

						<div className='flex items-center gap-3'>
							<MapPin className='w-5 h-5 text-muted-foreground' />
							<div>
								<p className='font-medium'>Location</p>
								<p className='text-muted-foreground'>Germany</p>
							</div>
						</div>

						<p className='pt-4 text-muted-foreground'>
							I&apos;d be happy if you&apos;d reach out to me for
							any feedback, feature requests, questions or
							whatsoever.
						</p>
					</CardContent>
				</Card>

				{/* Contact form */}
				<Card>
					<CardHeader>
						<CardTitle>Send a message</CardTitle>
					</CardHeader>
					<CardContent>
						<form className='space-y-4' onSubmit={handleSubmit}>
							<div>
								<label className='text-sm font-medium'>
									Your name
								</label>
								<Input
									name='name'
									placeholder='Lugo Hirsch'
									required
								/>
							</div>

							<div>
								<label className='text-sm font-medium'>
									Email address
								</label>
								<Input
									name='email'
									type='email'
									placeholder='lugo@hirsch.com'
									required
								/>
							</div>

							<div>
								<label className='text-sm font-medium'>
									Message
								</label>
								<Textarea
									name='message'
									placeholder="Tell me what you're looking for…"
									className='min-h-[20vh] md:min-h-[10vh]'
									required
								/>
							</div>

							<Button
								className='w-full'
								disabled={emailAlreadySent}
							>
								{isEmailSending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Sending message...
									</>
								) : (
									<>Send message</>
								)}
							</Button>
							{emailAlreadySent && emailSendSuccess && (
								<p className='text-green-500'>
									Message sent. Thanks!
								</p>
							)}
							{emailAlreadySent && !emailSendSuccess && (
								<p className='text-red-500'>
									There was an error sending the message.
									Please try sending it manually via your own
									email client
								</p>
							)}
						</form>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
