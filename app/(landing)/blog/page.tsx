import { JSX } from 'react';

export default function BlogPage(): JSX.Element {
	return (
		<main>
			<section className='py-20'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-2xl text-center'>
						<h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
							Your
							<span className='text-primary'> Blog </span>
							will live here
						</h1>
						<p className='text-muted-foreground mt-5 text-lg'>
							A blog page is used to share valuable content,
							updates, and insights with your audience. It helps
							build trust, improve SEO, and engage visitors by
							providing helpful information related to your
							product or industry.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
