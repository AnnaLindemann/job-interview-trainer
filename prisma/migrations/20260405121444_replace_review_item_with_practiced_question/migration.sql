/*
  Warnings:

  - You are about to drop the `ReviewItem` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropForeignKey
ALTER TABLE "ReviewItem" DROP CONSTRAINT "ReviewItem_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewItem" DROP CONSTRAINT "ReviewItem_questionId_fkey";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticedQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- 1) Add userId as nullable first
ALTER TABLE "PracticeSession"
ADD COLUMN "userId" TEXT;

-- 2) Create one fallback demo user for old sessions
INSERT INTO "User" ("id", "email", "createdAt")
VALUES ('demo_user', 'demo@local.dev', CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- 3) Backfill existing sessions
UPDATE "PracticeSession"
SET "userId" = 'demo_user'
WHERE "userId" IS NULL;

-- 4) Make userId required after backfill
ALTER TABLE "PracticeSession"
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PracticedQuestion_userId_addedAt_idx" ON "PracticedQuestion"("userId", "addedAt");

-- CreateIndex
CREATE INDEX "PracticedQuestion_questionId_idx" ON "PracticedQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticedQuestion_userId_questionId_key" ON "PracticedQuestion"("userId", "questionId");

-- CreateIndex
CREATE INDEX "PracticeSession_userId_idx" ON "PracticeSession"("userId");

-- AddForeignKey
ALTER TABLE "PracticeSession"
ADD CONSTRAINT "PracticeSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticedQuestion"
ADD CONSTRAINT "PracticedQuestion_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticedQuestion"
ADD CONSTRAINT "PracticedQuestion_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "Question"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable
DROP TABLE "ReviewItem";

-- DropEnum
DROP TYPE "ReviewStatus";