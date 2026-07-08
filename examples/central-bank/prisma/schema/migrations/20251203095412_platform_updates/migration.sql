-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."_LearningElementToPeriodSegment" ADD CONSTRAINT "_LearningElementToPeriodSegment_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_LearningElementToPeriodSegment_AB_unique";

-- AlterTable
ALTER TABLE "public"."_LearningElementToPlayer" ADD CONSTRAINT "_LearningElementToPlayer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_LearningElementToPlayer_AB_unique";

-- AlterTable
ALTER TABLE "public"."_PeriodSegmentToStoryElement" ADD CONSTRAINT "_PeriodSegmentToStoryElement_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_PeriodSegmentToStoryElement_AB_unique";

-- AlterTable
ALTER TABLE "public"."_PlayerToStoryElement" ADD CONSTRAINT "_PlayerToStoryElement_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_PlayerToStoryElement_AB_unique";

-- CreateTable
CREATE TABLE "public"."Specific" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specific_pkey" PRIMARY KEY ("id")
);
