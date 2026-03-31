-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('TEXT', 'VOICE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NEW', 'REVIEWED');

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "questionText" TEXT NOT NULL,
    "referenceAnswer" TEXT NOT NULL,
    "keyPoints" JSONB NOT NULL,
    "tags" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "inputMode" "InputMode" NOT NULL,
    "rawTranscript" TEXT,
    "finalAnswer" TEXT NOT NULL,
    "feedbackJson" JSONB,
    "technicalScore" INTEGER,
    "grammarScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewItem" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionTextSnapshot" TEXT NOT NULL,
    "referenceAnswerSnapshot" TEXT NOT NULL,
    "keyPointsSnapshot" JSONB,
    "topicSlug" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'NEW',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_roleSlug_topicSlug_language_idx" ON "Question"("roleSlug", "topicSlug", "language");

-- CreateIndex
CREATE INDEX "Question_isActive_idx" ON "Question"("isActive");

-- CreateIndex
CREATE INDEX "PracticeSession_topicSlug_language_idx" ON "PracticeSession"("topicSlug", "language");

-- CreateIndex
CREATE INDEX "Attempt_sessionId_idx" ON "Attempt"("sessionId");

-- CreateIndex
CREATE INDEX "Attempt_questionId_idx" ON "Attempt"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_createdAt_idx" ON "Attempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewItem_attemptId_key" ON "ReviewItem"("attemptId");

-- CreateIndex
CREATE INDEX "ReviewItem_questionId_idx" ON "ReviewItem"("questionId");

-- CreateIndex
CREATE INDEX "ReviewItem_topicSlug_language_idx" ON "ReviewItem"("topicSlug", "language");

-- CreateIndex
CREATE INDEX "ReviewItem_status_idx" ON "ReviewItem"("status");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewItem" ADD CONSTRAINT "ReviewItem_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewItem" ADD CONSTRAINT "ReviewItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
