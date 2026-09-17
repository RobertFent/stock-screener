'use server';

import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { validatedActionWithUserAndTeamId } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { logActivity } from './serverFunctions';
import { sendInvitation } from './auth/actions';
import { ActivityType, StripPlan, UserRole } from './enums';
import {
	addUserToTeam,
	createTeam,
	deleteFilterById,
	deleteTeamMember,
	getTeamSubscriptionByTeamId,
	insertNewFilter,
	selectAllFiltersByTeamId,
	updateDefaultFilterById,
	updateFilterById
} from './db/queries';
import { formatError } from './formatters';
import { filtersFormSchema } from './schemas/formSchemas';
import { parseFilterFormToDBForm } from './schemas/parsers';

const log = logger.child({
	server: 'action'
});

const updateAccountSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	email: z.email('Invalid email address')
});

export const updateAccount = validatedActionWithUserAndTeamId(
	updateAccountSchema,
	async (data, _, userWithTeam) => {
		const { name, email } = data;

		await Promise.all([
			db
				.update(users)
				.set({ name, email })
				.where(eq(users.id, userWithTeam.user.id)),
			logActivity(
				userWithTeam.teamId,
				userWithTeam.user.id,
				ActivityType.UPDATE_ACCOUNT
			)
		]);

		return { name, success: 'Account updated successfully.' };
	}
);

const removeTeamMemberSchema = z.object({
	memberId: z.string(),
	userId: z.string()
});

export const removeTeamMember = validatedActionWithUserAndTeamId(
	removeTeamMemberSchema,
	async (data, _, userWithTeam) => {
		const { memberId, userId } = data;

		try {
			await deleteTeamMember(memberId);

			await logActivity(
				userWithTeam.teamId,
				userWithTeam.user.id,
				ActivityType.REMOVE_TEAM_MEMBER
			);

			// create new default team for removed user
			const newTeam = await createTeam(userId);
			await addUserToTeam(userId, newTeam.id, UserRole.OWNER);
		} catch (error) {
			log.error(error);
			return {
				error: 'Error during removal of team member and deletion of user'
			};
		}

		log.debug(
			`Team member with member id: ${memberId} removed; Create new team for this user`
		);

		return { success: 'Team member removed' };
	}
);

const inviteTeamMemberSchema = z.object({
	email: z.email('Invalid email address'),
	role: z.enum(UserRole)
});

export const inviteTeamMember = validatedActionWithUserAndTeamId(
	inviteTeamMemberSchema,
	async (data, _, userWithTeam) => {
		const { email, role } = data;

		const existingMember = await db
			.select()
			.from(users)
			.leftJoin(teamMembers, eq(users.id, teamMembers.userId))
			.where(
				and(
					eq(users.email, email),
					eq(teamMembers.teamId, userWithTeam.teamId),
					isNull(users.deletedAt),
					isNull(teamMembers.deletedAt)
				)
			)
			.limit(1);

		if (existingMember.length > 0) {
			return { error: 'User is already a member of this team' };
		}

		// create a new clerk invitation
		try {
			await sendInvitation(email, userWithTeam.teamId, role);
		} catch (error) {
			log.error(formatError(error));
			return { error: 'User is already existing' };
		}

		await logActivity(
			userWithTeam.teamId,
			userWithTeam.user.id,
			ActivityType.INVITE_TEAM_MEMBER
		);

		log.debug(
			`User with id: ${userWithTeam.user.id} invited to team with id: ${userWithTeam.teamId}`
		);

		return { success: 'Invitation sent successfully' };
	}
);

/** Maximum number of saved presets per plan. */
const FILTER_LIMITS: Record<'free' | 'base', number> = {
	free: 3,
	base: 10
};

/**
 * Creates a new preset, or updates the existing one when the form carries an
 * `id`. The per plan quota is only enforced for newly created presets.
 */
export const saveFilter = validatedActionWithUserAndTeamId(
	filtersFormSchema,
	async (data, _, userWithTeam) => {
		try {
			const parsedFilter = parseFilterFormToDBForm(data);

			if (data.id) {
				const updated = await updateFilterById(
					data.id,
					userWithTeam.teamId,
					parsedFilter
				);
				if (!updated) {
					return { error: 'Filter not found', filterId: null };
				}
				await logActivity(
					userWithTeam.teamId,
					userWithTeam.user.id,
					ActivityType.UPDATE_FILTER
				);
				return {
					success: 'Filter updated successfully',
					filterId: data.id
				};
			}

			const [alreadyExistingFilters, teamPlan] = await Promise.all([
				selectAllFiltersByTeamId(userWithTeam.teamId),
				getTeamSubscriptionByTeamId(userWithTeam.teamId)
			]);

			const limit =
				teamPlan === StripPlan.BASE
					? FILTER_LIMITS.base
					: FILTER_LIMITS.free;

			if (alreadyExistingFilters.length >= limit) {
				return {
					error:
						teamPlan === StripPlan.BASE
							? `You have already ${limit} filters saved which is currently the maximum allowed amount.`
							: `You have already ${limit} filters saved. If you want to save more than ${limit} filters please upgrade your plan`,
					filterId: null
				};
			}

			const newFilterId = await insertNewFilter(
				parsedFilter,
				userWithTeam.user.id,
				userWithTeam.teamId
			);
			await logActivity(
				userWithTeam.teamId,
				userWithTeam.user.id,
				ActivityType.ADD_FILTER
			);
			return {
				success: 'Filter saved successfully',
				filterId: newFilterId
			};
		} catch (error) {
			log.error(formatError(error));
			return { error: 'Failed to save filter', filterId: null };
		}
	}
);

const deleteFilterSchema = z.object({
	id: z.string('Invalid filter id')
});
export const deleteFilter = validatedActionWithUserAndTeamId(
	deleteFilterSchema,
	async (data, _, userWithTeam) => {
		try {
			const deleted = await deleteFilterById(
				data.id,
				userWithTeam.teamId
			);
			if (!deleted) {
				return { error: 'Filter not found' };
			}
			await logActivity(
				userWithTeam.teamId,
				userWithTeam.user.id,
				ActivityType.DELETE_FILTER
			);
			return { success: 'Filter deleted successfully' };
		} catch (error) {
			log.error(formatError(error));
			return { error: 'Failed to delete filter' };
		}
	}
);

const updateDefaultFilterSchema = z.object({
	id: z.string('Invalid filter id')
});
export const updateDefaultFilter = validatedActionWithUserAndTeamId(
	updateDefaultFilterSchema,
	async (data, _, userWithTeam) => {
		try {
			const updated = await updateDefaultFilterById(
				data.id,
				userWithTeam.teamId
			);
			if (!updated) {
				return { error: 'Filter not found' };
			}
			return { success: 'Default filter updated' };
		} catch (error) {
			log.error(formatError(error));
			return { error: 'Failed to update default filter' };
		}
	}
);
