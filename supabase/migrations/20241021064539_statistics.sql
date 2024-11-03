-- Create server_statistics materialized view
CREATE MATERIALIZED VIEW server_statistics AS
WITH user_stats AS (
    SELECT 
        "serverId",
        "region",
        COUNT(DISTINCT "id") AS total_players,
        COUNT(DISTINCT "id") FILTER (WHERE "guildContributionsWeek" > 0) AS active_players,
        COUNT(DISTINCT "guildId") FILTER (WHERE "guildContributionsWeek" > 0) AS active_guilds,
        MAX("power") AS max_power,
        SUM("power") AS total_power
    FROM 
        users
    GROUP BY 
        "serverId",
        "region"
),
top_players AS (
    SELECT DISTINCT ON ("serverId", "region")
        "serverId",
        "region",
        "id" AS top_player_id,
        "name" AS top_player_name,
        "power" AS top_player_power
    FROM 
        users
    ORDER BY 
        "serverId",
        "region",
        "power" DESC
),
guild_stats AS (
    SELECT DISTINCT ON ("serverId", "region")
        "serverId",
        "region",
        COUNT(*) OVER (PARTITION BY "serverId", "region") AS total_guilds,
        FIRST_VALUE("id") OVER w AS top_guild_id_contributions,
        FIRST_VALUE("name") OVER w AS top_guild_name_contributions,
        FIRST_VALUE("contributions") OVER w AS top_guild_contributions,
        FIRST_VALUE("id") OVER w2 AS top_guild_id_power,
        FIRST_VALUE("name") OVER w2 AS top_guild_name_power,
        FIRST_VALUE("power") OVER w2 AS top_guild_power
    FROM 
        guilds
    WINDOW
        w AS (PARTITION BY "serverId", "region" ORDER BY "contributions" DESC),
        w2 AS (PARTITION BY "serverId", "region" ORDER BY "power" DESC)
)
SELECT 
    us."serverId",
    us."region",
    us.total_players AS "totalPlayers",
    us.active_players AS "activePlayers",
    gs.total_guilds AS "totalGuilds",
    us.active_guilds AS "activeGuilds",
    us.total_power AS "totalPower",
    gs.top_guild_id_contributions AS "topGuildIdByContributions",
    gs.top_guild_name_contributions AS "topGuildNameByContributions",
    gs.top_guild_contributions AS "topGuildContributions",
    gs.top_guild_id_power AS "topGuildIdByPower",
    gs.top_guild_name_power AS "topGuildNameByPower",
    gs.top_guild_power AS "topGuildPower",
    tp.top_player_id AS "topPlayerId",
    tp.top_player_name AS "topPlayerName",
    tp.top_player_power AS "topPlayerPower"
FROM 
    user_stats us
JOIN
    guild_stats gs ON us."serverId" = gs."serverId" AND us."region" = gs."region"
JOIN
    top_players tp ON us."serverId" = tp."serverId" AND us."region" = tp."region";

-- Create indexes on server_statistics
CREATE INDEX idx_server_statistics_serverId ON server_statistics ("serverId");
CREATE INDEX idx_server_statistics_region ON server_statistics ("region");
CREATE INDEX idx_server_statistics_serverId_region ON server_statistics ("serverId", "region");

-- Create cluster_statistics materialized view
CREATE MATERIALIZED VIEW cluster_statistics AS
WITH first_servers AS (
    SELECT 
        region,
        MIN("serverId") as first_server_id
    FROM 
        server_statistics
    GROUP BY 
        region
),
legacy_cluster_bounds AS (
    SELECT 
        ("serverId" - fs.first_server_id) / 5 AS "clusterId",
        ss."region",
        fs.first_server_id + (("serverId" - fs.first_server_id) / 5 * 5) AS "clusterStart",
        fs.first_server_id + (("serverId" - fs.first_server_id) / 5 * 5) + 4 AS "clusterEnd"
    FROM 
        server_statistics ss
    JOIN 
        first_servers fs ON ss.region = fs.region
    GROUP BY 
        ("serverId" - fs.first_server_id) / 5,
        ss."region",
        fs.first_server_id,
        fs.first_server_id + (("serverId" - fs.first_server_id) / 5 * 5)
),
combined_cluster_bounds AS (
    -- Merged servers from the clusters table
    SELECT 
        id AS "clusterId",
        region,
        "serverStart" AS "clusterStart",
        "serverEnd" AS "clusterEnd"
    FROM 
        clusters
    
    UNION ALL
    
    -- Non merged servers not in the clusters table
    SELECT 
        lcb."clusterId",
        lcb."region",
        lcb."clusterStart",
        lcb."clusterEnd"
    FROM 
        legacy_cluster_bounds lcb
    WHERE NOT EXISTS (
        SELECT 1 
        FROM clusters c 
        WHERE c.region = lcb.region 
        AND EXISTS (
            SELECT 1 
            FROM server_statistics ss 
            WHERE ss."serverId" BETWEEN lcb."clusterStart" AND lcb."clusterEnd"
            AND ss."serverId" BETWEEN c."serverStart" AND c."serverEnd"
            AND ss.region = c.region
        )
    )
)
SELECT 
    cb."clusterId",
    cb."region",
    SUM(ss."totalPlayers") AS "totalPlayers",
    SUM(ss."activePlayers") AS "activePlayers",
    SUM(ss."totalGuilds") AS "totalGuilds",
    SUM(ss."activeGuilds") AS "activeGuilds",
    SUM(ss."totalPower") AS "totalPower",
    cb."clusterStart",
    cb."clusterEnd",
    COUNT(DISTINCT ss."serverId") = (cb."clusterEnd" - cb."clusterStart" + 1) AS "fullCluster",
    (ARRAY_AGG(ss."topGuildIdByContributions" ORDER BY ss."topGuildContributions" DESC NULLS LAST))[1] AS "topGuildIdByContributions",
    (ARRAY_AGG(ss."topGuildNameByContributions" ORDER BY ss."topGuildContributions" DESC NULLS LAST))[1] AS "topGuildNameByContributions",
    MAX(ss."topGuildContributions") AS "topGuildContributions",
    (ARRAY_AGG(ss."topGuildIdByPower" ORDER BY ss."topGuildPower" DESC NULLS LAST))[1] AS "topGuildIdByPower",
    (ARRAY_AGG(ss."topGuildNameByPower" ORDER BY ss."topGuildPower" DESC NULLS LAST))[1] AS "topGuildNameByPower",
    MAX(ss."topGuildPower") AS "topGuildPower",
    (ARRAY_AGG(ss."topPlayerId" ORDER BY ss."topPlayerPower" DESC NULLS LAST))[1] AS "topPlayerId",
    (ARRAY_AGG(ss."topPlayerName" ORDER BY ss."topPlayerPower" DESC NULLS LAST))[1] AS "topPlayerName",
    MAX(ss."topPlayerPower") AS "topPlayerPower"
FROM 
    combined_cluster_bounds cb
LEFT JOIN 
    server_statistics ss 
    ON ss."serverId" BETWEEN cb."clusterStart" AND cb."clusterEnd"
    AND ss."region" = cb."region"
GROUP BY 
    cb."clusterId",
    cb."region",
    cb."clusterStart",
    cb."clusterEnd"
ORDER BY 
    cb."region",
    cb."clusterId";

-- Create indexes on cluster_statistics
CREATE INDEX idx_cluster_statistics_clusterId ON cluster_statistics ("clusterId");
CREATE INDEX idx_cluster_statistics_region ON cluster_statistics ("region");
CREATE INDEX idx_cluster_statistics_clusterId_region ON cluster_statistics ("clusterId", "region");
CREATE INDEX idx_cluster_statistics_fullCluster ON cluster_statistics ("fullCluster");

-- Create additional indexes to support common queries
CREATE INDEX idx_users_serverId_region ON users ("serverId", "region");
CREATE INDEX idx_guilds_serverId_region ON guilds ("serverId", "region");
CREATE INDEX idx_users_guildContributionsWeek ON users ("guildContributionsWeek");
CREATE INDEX idx_guilds_contributions ON guilds ("contributions");
CREATE INDEX idx_guilds_power ON guilds ("power");
CREATE INDEX idx_users_power ON users ("power");

GRANT SELECT ON server_statistics TO service_role;
GRANT SELECT ON cluster_statistics TO service_role;