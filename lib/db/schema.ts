import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	bigint,
	decimal,
	boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	clerkId: text('clerk_id'),
	name: varchar('name', { length: 100 }),
	email: varchar('email', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const teams = pgTable('teams', {
	id: uuid('id').primaryKey().defaultRandom(),
	stripeCustomerId: text('stripe_customer_id').unique(),
	stripeSubscriptionId: text('stripe_subscription_id').unique(),
	stripeProductId: text('stripe_product_id'),
	planName: varchar('plan_name', { length: 50 }),
	subscriptionStatus: varchar('subscription_status', { length: 20 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const teamMembers = pgTable('team_members', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => {
			return users.id;
		}),
	teamId: uuid('team_id')
		.notNull()
		.references(() => {
			return teams.id;
		}),
	role: varchar('role', { length: 50 }).notNull(),
	joinedAt: timestamp('joined_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const filters = pgTable('filters', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => {
			return users.id;
		}),
	teamId: uuid('team_id')
		.notNull()
		.references(() => {
			return teams.id;
		}),
	name: varchar('name', { length: 255 }).notNull(),
	minVolume: bigint('min_volume', { mode: 'number' }),
	maxRsi: decimal('max_rsi', { precision: 5, scale: 2 }),
	minIv: decimal('min_iv', { precision: 5, scale: 2 }),
	maxIv: decimal('max_iv', { precision: 5, scale: 2 }),
	minWillr: decimal('min_willr', { precision: 5, scale: 2 }),
	maxWillr: decimal('max_willr', { precision: 5, scale: 2 }),
	minStochK: decimal('min_stoch_k', { precision: 5, scale: 2 }),
	maxStochK: decimal('max_stoch_k', { precision: 5, scale: 2 }),
	macdIncreasing: boolean('macd_increasing').default(false),
	macdLineAboveSignal: boolean('macd_line_above_signal').default(false),
	closeAboveEma20AboveEma50: boolean('close_above_ema20_above_ema50').default(
		false
	),
	stochasticsKAboveD: boolean('stochastics_k_above_d').default(false),
	isDefault: boolean('is_default').default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const activityLogs = pgTable('activity_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	teamId: uuid('team_id')
		.notNull()
		.references(() => {
			return teams.id;
		}),
	userId: uuid('user_id').references(() => {
		return users.id;
	}),
	action: text('action').notNull(),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const teamsRelations = relations(teams, ({ many }) => {
	return {
		teamMembers: many(teamMembers),
		filters: many(filters),
		activityLogs: many(activityLogs)
	};
});

export const usersRelations = relations(users, ({ many }) => {
	return {
		teamMembers: many(teamMembers),
		filters: many(filters)
	};
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => {
	return {
		user: one(users, {
			fields: [teamMembers.userId],
			references: [users.id]
		}),
		team: one(teams, {
			fields: [teamMembers.teamId],
			references: [teams.id]
		})
	};
});

export const filtersRelations = relations(filters, ({ one }) => {
	return {
		team: one(teams, {
			fields: [filters.teamId],
			references: [teams.id]
		}),
		user: one(users, {
			fields: [filters.userId],
			references: [users.id]
		})
	};
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => {
	return {
		team: one(teams, {
			fields: [activityLogs.teamId],
			references: [teams.id]
		}),
		user: one(users, {
			fields: [activityLogs.userId],
			references: [users.id]
		})
	};
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type Filter = typeof filters.$inferSelect;
export type NewFilter = typeof filters.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type UserWithTeam = User & { team: TeamDataWithMembers };

export type TeamDataWithMembers = Team & {
	teamMembers: (TeamMember & {
		user: Pick<User, 'id' | 'name' | 'email' | 'clerkId'>;
	})[];
};
export type SanitizedActivityLog = Omit<ActivityLog, 'userId' | 'teamId'>;
export interface UserWithTeamId {
	user: User;
	teamId: string;
}
