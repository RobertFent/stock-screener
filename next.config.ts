import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	cacheComponents: true,
	serverExternalPackages: ['pino', 'pino-pretty'],
	async rewrites() {
		return [
			{
				source: '/ingest/static/:path*',
				destination: 'https://eu-assets.i.posthog.com/static/:path*'
			},
			{
				source: '/ingest/:path*',
				destination: 'https://eu.i.posthog.com/:path*'
			}
		];
	},
	// this is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true
};

export default nextConfig;
