import type { MergeDeep } from 'type-fest';

import type { Database as DatabaseGenerated } from './database-generated.types';

export type { Json, Tables } from './database-generated.types';

// Override the type for a specific column in a view:
export type Database = MergeDeep<
	DatabaseGenerated,
	{
		public: {
			Views: {
				cluster_statistics: {
					Row: {
						activeGuilds: number;
						activePlayers: number;
						clusterEnd: number;
						clusterId: number;
						clusterStart: number;
						fullCluster: boolean;
						region: string;
						topGuildContributions: number;
						topGuildIdByContributions: number;
						topGuildIdByPower: number;
						topGuildNameByContributions: string;
						topGuildNameByPower: string;
						topGuildPower: number;
						topPlayerId: number;
						topPlayerName: string;
						topPlayerPower: number;
						totalGuilds: number;
						totalPlayers: number;
						totalPower: number;
					};
				};
				guild_rankings: {
					Row: {
						contributions: number;
						createdAt: string;
						experience: number;
						globalContributionRank: number;
						globalPowerRank: number;
						icon: number;
						id: number;
						leaderName: string;
						level: number;
						name: string;
						notice: string;
						power: number;
						region: string;
						serverContributionRank: number;
						serverId: number;
						serverPowerRank: number;
						totalMembers: number;
						updatedAt: string;
					};
				};
				server_statistics: {
					Row: {
						activeGuilds: number;
						activePlayers: number;
						region: string;
						serverId: number;
						topGuildContributions: number;
						topGuildIdByContributions: number;
						topGuildIdByPower: number;
						topGuildNameByContributions: string;
						topGuildNameByPower: string;
						topGuildPower: number;
						topPlayerId: number;
						topPlayerName: string;
						topPlayerPower: number;
						totalGuilds: number;
						totalPlayers: number;
						totalPower: number;
					};
					Relationships: [];
				};
				user_rankings: {
					Row: {
						createdAt: string;
						globalPowerRank: number;
						guildContributions: number;
						guildContributionsWeek: number;
						guildId: number;
						guildName: string;
						guildPost: number;
						icon: string;
						id: number;
						level: number;
						name: string;
						offlineTime: string;
						power: number;
						region: string;
						serverId: number;
						serverPowerRank: number;
						updatedAt: string;
						vip: number;
					};
				};
			};
		};
	}
>;

export type Views<T extends keyof Database['public']['Views']> =
	Database['public']['Views'][T]['Row'];
