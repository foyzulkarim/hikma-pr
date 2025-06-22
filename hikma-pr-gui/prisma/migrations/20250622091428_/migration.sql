-- AlterTable
ALTER TABLE "Review" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "Review" ADD COLUMN "modelName" TEXT;
ALTER TABLE "Review" ADD COLUMN "modelProvider" TEXT;
ALTER TABLE "Review" ADD COLUMN "startedAt" DATETIME;
