-- CreateEnum
CREATE TYPE "public"."AchievementScope" AS ENUM ('GAME', 'PERIOD');

-- AlterTable
ALTER TABLE "public"."Achievement"
ADD COLUMN "scope" "public"."AchievementScope" NOT NULL DEFAULT 'GAME',
ADD COLUMN "activePeriods" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN "conditions" JSONB;

-- AlterTable
ALTER TABLE "public"."AchievementInstance"
ADD COLUMN "periodIx" INTEGER;

-- Backfill period index from linked periods
UPDATE "public"."AchievementInstance" ai
SET "periodIx" = p."index"
FROM "public"."Period" p
WHERE ai."periodId" = p."id";

-- Consolidate potential duplicates before adding uniqueness constraint
WITH grouped AS (
  SELECT
    "achievementId",
    "playerId",
    "periodIx",
    MIN("id") AS "keep_id",
    SUM("count") AS "total_count"
  FROM "public"."AchievementInstance"
  GROUP BY "achievementId", "playerId", "periodIx"
  HAVING COUNT(*) > 1
)
UPDATE "public"."AchievementInstance" ai
SET "count" = grouped."total_count"
FROM grouped
WHERE ai."id" = grouped."keep_id";

WITH grouped AS (
  SELECT
    "achievementId",
    "playerId",
    "periodIx",
    MIN("id") AS "keep_id"
  FROM "public"."AchievementInstance"
  GROUP BY "achievementId", "playerId", "periodIx"
  HAVING COUNT(*) > 1
)
DELETE FROM "public"."AchievementInstance" ai
USING grouped
WHERE ai."achievementId" = grouped."achievementId"
  AND ai."playerId" = grouped."playerId"
  AND ai."periodIx" = grouped."periodIx"
  AND ai."id" <> grouped."keep_id";

-- AlterTable
ALTER TABLE "public"."AchievementInstance"
ALTER COLUMN "periodIx" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AchievementInstance_achievementId_playerId_periodIx_key"
ON "public"."AchievementInstance"("achievementId", "playerId", "periodIx");

-- Remove transitional default to match Prisma schema
ALTER TABLE "public"."Achievement"
ALTER COLUMN "activePeriods" DROP DEFAULT;
