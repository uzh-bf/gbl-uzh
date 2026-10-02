-- AlterTable
ALTER TABLE "public"."Achievement"
ADD COLUMN "namesByRole" JSONB,
ADD COLUMN "descriptionsByRole" JSONB;
