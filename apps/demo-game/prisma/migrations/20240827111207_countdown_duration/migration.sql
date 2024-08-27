/*
  Warnings:

  - You are about to drop the column `avatar` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PeriodSegment" ADD COLUMN     "countdownDurationMs" INTEGER,
ADD COLUMN     "countdownExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "avatar",
DROP COLUMN "color",
DROP COLUMN "location",
ADD COLUMN     "number" INTEGER NOT NULL DEFAULT -1,
ALTER COLUMN "name" SET DEFAULT 'Anonymous';
