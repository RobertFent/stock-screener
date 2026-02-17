import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin } from 'lucide-react';
import { JSX } from 'react';

// todo: this is mostly copy & past compared to stock-screener/settings/contact
export default function ContactPage(): JSX.Element {
	return (
		<section className='xl:max-w-[50vw] p-4 lg:p-8'>
			<h1 className='text-lg lg:text-2xl font-medium mb-6'>Contact</h1>
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
						I&apos;d be happy if you&apos;d reach out to me for any
						feedback, feature requests, questions or whatsoever.
					</p>
				</CardContent>
			</Card>
		</section>
	);
}
