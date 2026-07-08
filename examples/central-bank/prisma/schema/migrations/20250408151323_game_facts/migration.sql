/*
  Warnings:

  - Added the required column `facts` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_activePeriodId_fkey";

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_activeSegmentId_fkey";

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_gameId_fkey";

-- DropForeignKey
ALTER TABLE "PeriodSegment" DROP CONSTRAINT "PeriodSegment_gameId_fkey";

-- DropForeignKey
ALTER TABLE "PeriodSegment" DROP CONSTRAINT "PeriodSegment_periodId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_levelIx_fkey";

-- DropForeignKey
ALTER TABLE "PlayerAction" DROP CONSTRAINT "PlayerAction_gameId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerAction" DROP CONSTRAINT "PlayerAction_periodId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerAction" DROP CONSTRAINT "PlayerAction_playerId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerAction" DROP CONSTRAINT "PlayerAction_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerResult" DROP CONSTRAINT "PlayerResult_gameId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerResult" DROP CONSTRAINT "PlayerResult_periodId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerResult" DROP CONSTRAINT "PlayerResult_playerId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "facts" JSONB NOT NULL DEFAULT '{}'::JSONB;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_activePeriodId_fkey" FOREIGN KEY ("activePeriodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_activeSegmentId_fkey" FOREIGN KEY ("activeSegmentId") REFERENCES "PeriodSegment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSegment" ADD CONSTRAINT "PeriodSegment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSegment" ADD CONSTRAINT "PeriodSegment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_levelIx_fkey" FOREIGN KEY ("levelIx") REFERENCES "PlayerLevel"("index") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAction" ADD CONSTRAINT "PlayerAction_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "PeriodSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;
