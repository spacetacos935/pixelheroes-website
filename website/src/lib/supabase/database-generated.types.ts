export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			guilds: {
				Row: {
					contributions: number;
					createdAt: string;
					experience: number;
					icon: number;
					id: number;
					leaderName: string;
					level: number;
					name: string;
					notice: string | null;
					power: number;
					region: string;
					serverId: number;
					totalMembers: number;
					updatedAt: string | null;
				};
				Insert: {
					contributions?: number;
					createdAt?: string;
					experience?: number;
					icon: number;
					id: number;
					leaderName: string;
					level: number;
					name: string;
					notice?: string | null;
					power: number;
					region: string;
					serverId: number;
					totalMembers: number;
					updatedAt?: string | null;
				};
				Update: {
					contributions?: number;
					createdAt?: string;
					experience?: number;
					icon?: number;
					id?: number;
					leaderName?: string;
					level?: number;
					name?: string;
					notice?: string | null;
					power?: number;
					region?: string;
					serverId?: number;
					totalMembers?: number;
					updatedAt?: string | null;
				};
				Relationships: [];
			};
			users: {
				Row: {
					createdAt: string;
					guildContributions: number;
					guildContributionsWeek: number;
					guildId: number;
					guildPost: number;
					icon: string;
					id: number;
					level: number;
					name: string;
					offlineTime: string | null;
					power: number;
					region: string;
					serverId: number;
					updatedAt: string | null;
					vip: number | null;
				};
				Insert: {
					createdAt?: string;
					guildContributions?: number;
					guildContributionsWeek?: number;
					guildId: number;
					guildPost?: number;
					icon: string;
					id: number;
					level: number;
					name: string;
					offlineTime?: string | null;
					power: number;
					region: string;
					serverId: number;
					updatedAt?: string | null;
					vip?: number | null;
				};
				Update: {
					createdAt?: string;
					guildContributions?: number;
					guildContributionsWeek?: number;
					guildId?: number;
					guildPost?: number;
					icon?: string;
					id?: number;
					level?: number;
					name?: string;
					offlineTime?: string | null;
					power?: number;
					region?: string;
					serverId?: number;
					updatedAt?: string | null;
					vip?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'users_guildId_fkey';
						columns: ['guildId'];
						isOneToOne: false;
						referencedRelation: 'guild_rankings';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'users_guildId_fkey';
						columns: ['guildId'];
						isOneToOne: false;
						referencedRelation: 'guilds';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			cluster_statistics: {
				Row: {
					activeGuilds: number | null;
					activePlayers: number | null;
					clusterEnd: number | null;
					clusterId: number | null;
					clusterStart: number | null;
					fullCluster: boolean | null;
					region: string | null;
					topGuildContributions: number | null;
					topGuildIdByContributions: number | null;
					topGuildIdByPower: number | null;
					topGuildNameByContributions: string | null;
					topGuildNameByPower: string | null;
					topGuildPower: number | null;
					topPlayerId: number | null;
					topPlayerName: string | null;
					topPlayerPower: number | null;
					totalGuilds: number | null;
					totalPlayers: number | null;
					totalPower: number | null;
				};
				Relationships: [];
			};
			guild_rankings: {
				Row: {
					contributions: number | null;
					createdAt: string | null;
					experience: number | null;
					globalContributionRank: number | null;
					globalPowerRank: number | null;
					icon: number | null;
					id: number | null;
					leaderName: string | null;
					level: number | null;
					name: string | null;
					notice: string | null;
					power: number | null;
					region: string | null;
					serverContributionRank: number | null;
					serverId: number | null;
					serverPowerRank: number | null;
					totalMembers: number | null;
					updatedAt: string | null;
				};
				Relationships: [];
			};
			server_statistics: {
				Row: {
					activeGuilds: number | null;
					activePlayers: number | null;
					region: string | null;
					serverId: number | null;
					topGuildContributions: number | null;
					topGuildIdByContributions: number | null;
					topGuildIdByPower: number | null;
					topGuildNameByContributions: string | null;
					topGuildNameByPower: string | null;
					topGuildPower: number | null;
					topPlayerId: number | null;
					topPlayerName: string | null;
					topPlayerPower: number | null;
					totalGuilds: number | null;
					totalPlayers: number | null;
					totalPower: number | null;
				};
				Relationships: [];
			};
			user_rankings: {
				Row: {
					createdAt: string | null;
					globalPowerRank: number | null;
					guildContributions: number | null;
					guildContributionsWeek: number | null;
					guildId: number | null;
					guildName: string | null;
					guildPost: number | null;
					icon: string | null;
					id: number | null;
					level: number | null;
					name: string | null;
					offlineTime: string | null;
					power: number | null;
					region: string | null;
					serverId: number | null;
					serverPowerRank: number | null;
					updatedAt: string | null;
					vip: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'users_guildId_fkey';
						columns: ['guildId'];
						isOneToOne: false;
						referencedRelation: 'guilds';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'users_guildId_fkey';
						columns: ['guildId'];
						isOneToOne: false;
						referencedRelation: 'guild_rankings';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Functions: {
			refresh_materialized_view: {
				Args: {
					view_name: string;
				};
				Returns: undefined;
			};
			refresh_statistics: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
