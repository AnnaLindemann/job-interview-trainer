-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "usedVoice" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Attempt_usedVoice_idx" ON "Attempt"("usedVoice");
