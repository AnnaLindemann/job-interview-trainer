/*
  Warnings:

  - A unique constraint covering the columns `[roleSlug,topicSlug,language,questionKey]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionKey` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Question_roleSlug_topicSlug_language_questionKey_key" ON "Question"("roleSlug", "topicSlug", "language", "questionKey");
