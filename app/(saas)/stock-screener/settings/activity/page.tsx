import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityLogs } from '@/lib/db/queries';
import { ActivityType } from '@/lib/enums';
import {
	Settings,
	LogOut,
	UserPlus,
	UserCog,
	AlertCircle,
	UserMinus,
	Mail,
	CheckCircle,
	Filter as FilterIcon,
	FilePlus,
	Trash2,
	type LucideIcon
} from 'lucide-react';
import { JSX } from 'react';

const iconMap: Record<ActivityType, LucideIcon> = {
	[ActivityType.SIGN_UP]: UserPlus,
	[ActivityType.SIGN_IN]: UserCog,
	[ActivityType.SIGN_OUT]: LogOut,
	[ActivityType.UPDATE_ACCOUNT]: Settings,
	[ActivityType.CREATE_TEAM]: UserPlus,
	[ActivityType.DELETE_TEAM]: UserMinus,
	[ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
	[ActivityType.INVITE_TEAM_MEMBER]: Mail,
	[ActivityType.ACCEPT_INVITATION]: CheckCircle,
	[ActivityType.ADD_FILTER]: FilePlus,
	[ActivityType.UPDATE_FILTER]: FilterIcon,
	[ActivityType.DELETE_FILTER]: Trash2
};

const getRelativeTime = (date: Date): string => {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return 'just now';
	}
	if (diffInSeconds < 3600) {
		return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	}
	if (diffInSeconds < 86400) {
		return `${Math.floor(diffInSeconds / 3600)} hours ago`;
	}
	if (diffInSeconds < 604800) {
		return `${Math.floor(diffInSeconds / 86400)} days ago`;
	}
	return date.toLocaleDateString();
};

function formatAction(action: ActivityType): string {
	switch (action) {
		case ActivityType.SIGN_UP:
			return 'You signed up';
		case ActivityType.SIGN_IN:
			return 'You signed in';
		case ActivityType.SIGN_OUT:
			return 'You signed out';
		case ActivityType.UPDATE_ACCOUNT:
			return 'You updated your account';
		case ActivityType.CREATE_TEAM:
			return 'You created a new team';
		case ActivityType.REMOVE_TEAM_MEMBER:
			return 'You removed a team member';
		case ActivityType.INVITE_TEAM_MEMBER:
			return 'You invited a team member';
		case ActivityType.ACCEPT_INVITATION:
			return 'You accepted an invitation';
		case ActivityType.ADD_FILTER:
			return 'You added a filter preset';
		case ActivityType.UPDATE_FILTER:
			return 'You updated a filter preset';
		case ActivityType.DELETE_FILTER:
			return 'You deleted a filter preset';
		default:
			return 'Unknown action occurred';
	}
}

export default async function ActivityPage(): Promise<JSX.Element> {
	const logs = await getActivityLogs();

	return (
		<section>
			<h1 className='mb-1 text-2xl font-semibold tracking-tight'>
				Activity log
			</h1>
			<p className='text-muted-foreground mb-6 text-sm'>
				The last ten actions on your account.
			</p>
			<Card>
				<CardHeader>
					<CardTitle>Recent activity</CardTitle>
				</CardHeader>
				<CardContent>
					{logs.length > 0 ? (
						<ul className='space-y-4'>
							{logs.map((log) => {
								const Icon =
									iconMap[log.action as ActivityType] ||
									Settings;
								const formattedAction = formatAction(
									log.action as ActivityType
								);

								return (
									<li
										key={log.id}
										className='flex items-center gap-3'
									>
										<div className='bg-primary/12 text-primary ring-primary/20 flex size-9 shrink-0 items-center justify-center rounded-full ring-1'>
											<Icon className='size-4' />
										</div>
										<div className='min-w-0 flex-1'>
											<p className='truncate text-sm font-medium'>
												{formattedAction}
											</p>
											<p className='text-muted-foreground text-xs'>
												{getRelativeTime(
													new Date(log.timestamp)
												)}
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					) : (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<AlertCircle className='text-muted-foreground mb-4 size-10' />
							<h3 className='mb-2 text-lg font-semibold'>
								No activity yet
							</h3>
							<p className='text-muted-foreground max-w-sm text-sm'>
								When you perform actions like signing in,
								they&apos;ll appear here.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
}
