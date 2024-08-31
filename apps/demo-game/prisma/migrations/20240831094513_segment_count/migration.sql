/*
  Warnings:

  - You are about to drop the column `avatar` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Player` table. All the data in the column will be lost.
  - Added the required column `segmentCount` to the `Period` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "segmentCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PeriodSegment" ADD COLUMN     "countdownExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "avatar",
DROP COLUMN "color",
DROP COLUMN "location",
ADD COLUMN     "number" INTEGER NOT NULL DEFAULT -1,
ALTER COLUMN "name" SET DEFAULT 'Anonymous';
