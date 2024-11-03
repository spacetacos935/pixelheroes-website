CREATE MATERIALIZED VIEW user_rankings AS
SELECT 
    u.*,
    g.name AS "guildName",
    RANK() OVER (ORDER BY u.power DESC) as "globalPowerRank",
    RANK() OVER (PARTITION BY u."serverId" ORDER BY u.power DESC) as "serverPowerRank"
FROM 
    users u
LEFT JOIN
    guilds g ON u."guildId" = g.id;

CREATE INDEX idx_user_power_rankings_global_power_rank ON user_rankings("globalPowerRank");
CREATE INDEX idx_user_power_rankings_server_power_rank ON user_rankings("serverPowerRank");
CREATE INDEX idx_user_power_rankings_name ON user_rankings(name);

CREATE MATERIALIZED VIEW guild_rankings AS
SELECT 
    *,
    RANK() OVER (ORDER BY power DESC) as "globalPowerRank",
    RANK() OVER (PARTITION BY "serverId" ORDER BY power DESC) as "serverPowerRank",
    RANK() OVER (ORDER BY contributions DESC) as "globalContributionRank",
    RANK() OVER (PARTITION BY "serverId" ORDER BY contributions DESC) as "serverContributionRank"
FROM 
    guilds;

CREATE INDEX idx_guild_rankings_global_power_rank ON guild_rankings("globalPowerRank");
CREATE INDEX idx_guild_rankings_server_power_rank ON guild_rankings("serverPowerRank");
CREATE INDEX idx_guild_rankings_global_contribution_rank ON guild_rankings("globalContributionRank");
CREATE INDEX idx_guild_rankings_server_contribution_rank ON guild_rankings("serverContributionRank");
CREATE INDEX idx_guild_rankings_name ON guild_rankings(name);
CREATE INDEX idx_guild_rankings_notice ON guild_rankings(notice);

GRANT SELECT ON guild_rankings TO service_role;
GRANT SELECT ON user_rankings TO service_role;

CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('REFRESH MATERIALIZED VIEW %I', view_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;