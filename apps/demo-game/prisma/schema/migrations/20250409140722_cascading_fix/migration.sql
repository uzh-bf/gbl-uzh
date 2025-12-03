-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_activePeriodId_fkey";

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_activeSegmentId_fkey";

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_nextPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "PeriodSegment" DROP CONSTRAINT "PeriodSegment_nextSegmentId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_levelIx_fkey";

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_activePeriodId_fkey" FOREIGN KEY ("activePeriodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_activeSegmentId_fkey" FOREIGN KEY ("activeSegmentId") REFERENCES "PeriodSegment"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_nextPeriodId_fkey" FOREIGN KEY ("nextPeriodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PeriodSegment" ADD CONSTRAINT "PeriodSegment_nextSegmentId_fkey" FOREIGN KEY ("nextSegmentId") REFERENCES "PeriodSegment"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_levelIx_fkey" FOREIGN KEY ("levelIx") REFERENCES "PlayerLevel"("index") ON DELETE NO ACTION ON UPDATE CASCADE;
