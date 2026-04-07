/*
  Warnings:

  - You are about to drop the column `questionId` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `PracticedQuestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,roleSlug,topicSlug,language,questionKey]` on the table `PracticedQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `difficulty` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionKey` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionTextSnapshot` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceAnswerSnapshot` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleSlug` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicSlug` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionKey` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionTextSnapshot` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceAnswerSnapshot` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleSlug` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicSlug` to the `PracticedQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_questionId_fkey";

-- DropForeignKey
ALTER TABLE "PracticedQuestion" DROP CONSTRAINT "PracticedQuestion_questionId_fkey";

-- DropIndex
DROP INDEX "Attempt_questionId_idx";

-- DropIndex
DROP INDEX "PracticedQuestion_questionId_idx";

-- DropIndex
DROP INDEX "PracticedQuestion_userId_questionId_key";

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "questionId",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "questionKey" TEXT NOT NULL,
ADD COLUMN     "questionTextSnapshot" TEXT NOT NULL,
ADD COLUMN     "referenceAnswerSnapshot" TEXT NOT NULL,
ADD COLUMN     "roleSlug" TEXT NOT NULL,
ADD COLUMN     "topicSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PracticedQuestion" DROP COLUMN "questionId",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "questionKey" TEXT NOT NULL,
ADD COLUMN     "questionTextSnapshot" TEXT NOT NULL,
ADD COLUMN     "referenceAnswerSnapshot" TEXT NOT NULL,
ADD COLUMN     "roleSlug" TEXT NOT NULL,
ADD COLUMN     "topicSlug" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Attempt_questionKey_idx" ON "Attempt"("questionKey");

-- CreateIndex
CREATE INDEX "Attempt_topicSlug_language_idx" ON "Attempt"("topicSlug", "language");

-- CreateIndex
CREATE INDEX "PracticedQuestion_topicSlug_language_idx" ON "PracticedQuestion"("topicSlug", "language");

-- CreateIndex
CREATE INDEX "PracticedQuestion_questionKey_idx" ON "PracticedQuestion"("questionKey");

-- CreateIndex
CREATE UNIQUE INDEX "PracticedQuestion_userId_roleSlug_topicSlug_language_questi_key" ON "PracticedQuestion"("userId", "roleSlug", "topicSlug", "language", "questionKey");
