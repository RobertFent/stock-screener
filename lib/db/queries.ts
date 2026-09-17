import 'server-only';
import { desc, eq, and, isNull, sql } from 'drizzle-orm';
import { db, stockAnalysisDb } from './drizzle';
import {
	activityLogs,
	Filter,
	filters,
	SanitizedActivityLog,
	Team,
	TeamDataWithMembers,
	teamMembers,
	teams,
	User,
	users,
	UserWithTeamId
} from './schema';
import { getCurrentAppUser } from '../auth/actions';
import { logActivity } from '../serverFunctions';
import { ActivityType, UserRole } from '../enums';
import { FilterDBInput } from '../schemas/databaseSchemas';
import {
	enrichedStockData,
	enrichedStockDataList,
	type EnrichedStockDataList
} from '../schemas/stockSchemas';

// re-exported for backwards compatibility; the canonical definition lives in
// `lib/schemas/stockSchemas.ts` so client components can import it safely
export { enrichedStockData, enrichedStockDataList };

export const getUserByClerkId = async (
	clerkId: string
): Promise<User | null> => {
	const result = await db
		.select()
		.from(users)
		.where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt)))
		.limit(1);

	// todo: could be more generic
	return result.length > 0 ? result[0] : null;
};

export const getTeamByStripeCustomerId = async (
	customerId: string
): Promise<Team | null> => {
	const result = await db
		.select()
		.from(teams)
		.where(
			and(eq(teams.stripeCustomerId, customerId), isNull(teams.deletedAt))
		)
		.limit(1);

	return result.length > 0 ? result[0] : null;
};

export const updateTeamSubscription = async (
	teamId: string,
	subscriptionData: {
		stripeSubscriptionId: string | null;
		stripeProductId: string | null;
		planName: string | null;
		subscriptionStatus: string;
	}
): Promise<void> => {
	await db
		.update(teams)
		.set({
			...subscriptionData,
			updatedAt: new Date()
		})
		.where(eq(teams.id, teamId));
};

export const getTeamSubscriptionByTeamId = async (
	teamId: string
): Promise<string | null> => {
	const team = await db
		.select({ planName: teams.planName })
		.from(teams)
		.where(eq(teams.id, teamId));

	return team.length > 0 ? team[0].planName : null;
};

export const getUserWithTeam = async (
	userId: string
): Promise<UserWithTeamId | null> => {
	const result = await db
		.select({
			user: users,
			teamId: teamMembers.teamId
		})
		.from(users)
		.innerJoin(teamMembers, eq(users.id, teamMembers.userId))
		.where(
			and(
				eq(users.id, userId),
				isNull(users.deletedAt),
				isNull(teamMembers.deletedAt)
			)
		)
		.limit(1);

	return result.length > 0 ? result[0] : null;
};

export const getActivityLogs = async (): Promise<SanitizedActivityLog[]> => {
	const user = await getCurrentAppUser();

	return await db
		.select({
			id: activityLogs.id,
			action: activityLogs.action,
			timestamp: activityLogs.timestamp,
			userName: users.name
		})
		.from(activityLogs)
		.leftJoin(users, eq(activityLogs.userId, users.id))
		.where(eq(activityLogs.userId, user.id))
		.orderBy(desc(activityLogs.timestamp))
		.limit(10);
};

export const getTeamForUser = async (
	userId: string
): Promise<TeamDataWithMembers | null> => {
	const result = await db.query.teamMembers.findFirst({
		where: and(
			eq(teamMembers.userId, userId),
			isNull(teamMembers.deletedAt) // get team by team membership of current user
		),
		with: {
			team: {
				with: {
					teamMembers: {
						where: isNull(teamMembers.deletedAt), // filter out all deleted other team memberships of current team
						with: {
							user: {
								columns: {
									id: true,
									name: true,
									email: true,
									clerkId: true
								}
							}
						}
					}
				}
			}
		}
	});

	return result?.team || null;
};

export const createUser = async (
	clerkId: string,
	email: string,
	name: string
): Promise<User> => {
	const user = await db
		.insert(users)
		.values({
			clerkId: clerkId,
			email,
			name
		})
		.returning();

	if (user.length < 1) {
		throw Error('Failed creating user');
	}

	return user[0];
};

export const createTeam = async (userId: string): Promise<Team> => {
	const team = await db.insert(teams).values({}).returning();

	if (team.length < 1) {
		throw Error('Failed creating team');
	}

	const newTeam = team[0];

	await logActivity(newTeam.id, userId, ActivityType.CREATE_TEAM);

	return newTeam;
};

export const addUserToTeam = async (
	userId: string,
	teamId: string,
	role: UserRole
): Promise<void> => {
	const newTeamMember = await db
		.insert(teamMembers)
		.values({
			userId: userId,
			teamId: teamId,
			role: role
		})
		.returning();

	if (newTeamMember.length < 1) {
		throw Error('Failed creating team membership for user');
	}

	await logActivity(
		newTeamMember[0].teamId,
		newTeamMember[0].userId,
		ActivityType.SIGN_UP
	);
};

export const deleteTeamMember = async (teamMemberId: string): Promise<void> => {
	await db
		.update(teamMembers)
		.set({ deletedAt: new Date() })
		.where(and(eq(teamMembers.id, teamMemberId)));
};

export const deleteUserWithTeamMembership = async (
	clerkId: string
): Promise<void> => {
	const user = await db.query.users.findFirst({
		where: and(eq(users.clerkId, clerkId), isNull(users.deletedAt))
	});

	if (!user) {
		throw Error('User not found');
	}

	const [deletedTeamMemberships, deletedUsers] = await Promise.all([
		await db
			.update(teamMembers)
			.set({ deletedAt: new Date() })
			.where(eq(teamMembers.userId, user.id))
			.returning(),
		await db
			.update(users)
			.set({ deletedAt: new Date() })
			.where(eq(users.id, user.id))
			.returning()
	]);

	if (deletedTeamMemberships.length < 1 || deletedUsers.length < 1) {
		throw Error('Error on deleting user or its team membership');
	}

	const deletedTeamMembership = deletedTeamMemberships[0];

	const remainingTeamMembers = await db
		.select()
		.from(teamMembers)
		.where(
			and(
				eq(teamMembers.teamId, deletedTeamMembership.teamId),
				isNull(teamMembers.deletedAt)
			)
		);

	await logActivity(
		deletedTeamMemberships[0].teamId,
		user.id,
		ActivityType.REMOVE_TEAM_MEMBER
	);

	if (remainingTeamMembers.length === 0) {
		await db
			.update(teams)
			.set({ deletedAt: new Date() })
			.where(eq(teams.id, deletedTeamMemberships[0].teamId));

		await logActivity(
			deletedTeamMemberships[0].teamId,
			user.id,
			ActivityType.DELETE_TEAM
		);
	}
};

/**
 * Latest row per ticker, enriched with the two previous MACD values so the
 * client can evaluate "MACD increasing" without a second round trip.
 *
 * Only the three most recent rows per ticker are touched (via a lateral join on
 * the `(ticker, date DESC)` index) instead of scanning the whole history.
 */
export const selectAllStocks = async (): Promise<EnrichedStockDataList> => {
	const result = await stockAnalysisDb.execute(sql`
		WITH tickers AS (
			SELECT DISTINCT ticker FROM stock_data
		),
		recent AS (
			SELECT sd.*
			FROM tickers t
			CROSS JOIN LATERAL (
				SELECT *
				FROM stock_data
				WHERE ticker = t.ticker
				ORDER BY date DESC
				LIMIT 3
			) sd
		),
		enriched AS (
			SELECT
				*,
				ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY date DESC) AS rn,
				LAG(macd_line, 1) OVER (PARTITION BY ticker ORDER BY date) AS macd_line_prev_day,
				LAG(macd_line, 2) OVER (PARTITION BY ticker ORDER BY date) AS macd_line_prev_prev_day
			FROM recent
		)
		SELECT
			id, ticker, index, date::text AS date, close, high, low, open, volume,
			ema20, ema50, macd_line, signal_line, rsi_4, rsi_14, iv,
			willr_4, willr_14, last_updated_at::text AS last_updated_at,
			stoch_percent_k, stoch_percent_d,
			macd_line_prev_day, macd_line_prev_prev_day,
			adr_7, adr_14, ma_200
		FROM enriched
		WHERE rn = 1
		ORDER BY ticker;
	`);

	// an empty result is a legitimate state (fresh local database, scraper has
	// not run yet) and is rendered as an empty screener rather than a crash
	return enrichedStockDataList.parse(result);
};

export const selectAllFiltersByTeamId = async (
	teamId: string
): Promise<Filter[]> => {
	const allFilters = await db
		.select()
		.from(filters)
		.where(and(eq(filters.teamId, teamId), isNull(filters.deletedAt)))
		.orderBy(filters.createdAt);

	return allFilters;
};

export const insertNewFilter = async (
	filter: FilterDBInput,
	userId: string,
	teamId: string
): Promise<string> => {
	const newFilter = await db
		.insert(filters)
		.values({
			...filter,
			teamId: teamId,
			userId: userId
		})
		.returning();

	if (newFilter.length < 1) {
		throw Error('Failed creating new filter');
	}
	// todo: cleaner
	return newFilter[0].id;
};

/**
 * Updates an existing preset in place. Scoped to the team so a filter id from
 * another team can never be written to.
 */
export const updateFilterById = async (
	filterId: string,
	teamId: string,
	filter: FilterDBInput
): Promise<boolean> => {
	const updated = await db
		.update(filters)
		.set({
			name: filter.name,
			indices: filter.indices ?? null,
			minVolume: filter.minVolume ?? null,
			minClose: filter.minClose ?? null,
			maxClose: filter.maxClose ?? null,
			minAdrPercent7: filter.minAdrPercent7 ?? null,
			maxRSI4: filter.maxRSI4 ?? null,
			maxRSI14: filter.maxRSI14 ?? null,
			minIV: filter.minIV ?? null,
			maxIV: filter.maxIV ?? null,
			minWillr4: filter.minWillr4 ?? null,
			maxWillr4: filter.maxWillr4 ?? null,
			minWillr14: filter.minWillr14 ?? null,
			maxWillr14: filter.maxWillr14 ?? null,
			minStochK: filter.minStochK ?? null,
			maxStochK: filter.maxStochK ?? null,
			macdIncreasing: filter.macdIncreasing ?? false,
			macdLineAboveSignal: filter.macdLineAboveSignal ?? false,
			closeAboveEma20AboveEma50:
				filter.closeAboveEma20AboveEma50 ?? false,
			closeAboveMA200: filter.closeAboveMA200 ?? false,
			stochasticsKAboveD: filter.stochasticsKAboveD ?? false
		})
		.where(
			and(
				eq(filters.id, filterId),
				eq(filters.teamId, teamId),
				isNull(filters.deletedAt)
			)
		)
		.returning({ id: filters.id });

	return updated.length > 0;
};

/**
 * Soft deletes a preset. Scoped to the team, otherwise any authenticated user
 * could delete another team's filter by guessing its id.
 */
export const deleteFilterById = async (
	filterId: string,
	teamId: string
): Promise<boolean> => {
	const deleted = await db
		.update(filters)
		.set({ deletedAt: new Date() })
		.where(
			and(
				eq(filters.id, filterId),
				eq(filters.teamId, teamId),
				isNull(filters.deletedAt)
			)
		)
		.returning({ id: filters.id });

	return deleted.length > 0;
};

/**
 * Marks one preset as the team default. Runs in a transaction so the team can
 * never end up without (or with several) default filters.
 */
export const updateDefaultFilterById = async (
	filterId: string,
	teamId: string
): Promise<boolean> => {
	return await db.transaction(async (tx) => {
		await tx
			.update(filters)
			.set({ isDefault: false })
			.where(eq(filters.teamId, teamId));

		const updated = await tx
			.update(filters)
			.set({ isDefault: true })
			.where(
				and(
					eq(filters.id, filterId),
					eq(filters.teamId, teamId),
					isNull(filters.deletedAt)
				)
			)
			.returning({ id: filters.id });

		return updated.length > 0;
	});
};
