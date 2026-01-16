import { withApiAuthAndTryCatch } from '@/lib/auth/middleware';
import { getTeamForUser, selectAllFiltersByTeamId } from '@/lib/db/queries';
import { Filter } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export const GET = withApiAuthAndTryCatch<
	[Request],
	Filter[] | { error: string }
>(async (user, _req) => {
	const team = await getTeamForUser(user.id);

	if (!team) {
		return NextResponse.json(
			{
				error: 'You are not assigned to any team. This should never happen. Please contact an administrator or create a new account'
			},
			{ status: 500 }
		);
	}

	const filters = await selectAllFiltersByTeamId(team.id);
	return NextResponse.json(filters, { status: 200 });
});
