-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "reviewerId" TEXT;

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");
