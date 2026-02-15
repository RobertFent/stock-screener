import { revalidatePath } from 'next/cache';

// this endpoint does not use user auth because its inteded to be called by scrapers
export const POST = (req: Request): Response => {
	const secret = req.headers.get('x-revalidate-secret');

	if (secret !== process.env.REVALIDATE_SECRET) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// invalidate cache for stock screener so that user fetches updated stock data
	revalidatePath('/stock-screener', 'page');

	return Response.json({ revalidated: true, now: Date.now() });
};
