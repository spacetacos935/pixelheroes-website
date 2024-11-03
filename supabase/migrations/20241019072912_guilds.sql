SET timezone TO 'UTC';

CREATE TABLE "guilds" (
    "id" BIGINT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NO NULL,
    "serverId" INTEGER NOT NULL,
    "notice" TEXT,
    "level" INTEGER NOT NULL,
    "experience" BIGINT NOT NULL DEFAULT 0,
    "power" BIGINT NOT NULL,
    "icon" INTEGER NOT NULL,
    "contributions" BIGINT NOT NULL DEFAULT 0,
    "totalMembers" INTEGER NOT NULL,
    "leaderName" TEXT NOT NULL,
    "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "users" (
    "id" BIGINT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NO NULL,
    "serverId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "power" BIGINT NOT NULL,
    "icon" TEXT NOT NULL,
    "vip" INTEGER,
    "offlineTime" TIMESTAMP(3),
    "guildContributions" BIGINT NOT NULL DEFAULT 0,
    "guildContributionsWeek" BIGINT NOT NULL DEFAULT 0,
    "guildPost" INTEGER NOT NULL DEFAULT 0,
    "guildId" BIGINT NOT NULL REFERENCES guilds(id),
    "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE
);
 
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;