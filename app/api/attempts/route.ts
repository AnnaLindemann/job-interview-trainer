import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/src/db/prisma";
import { mockAnalyzeAnswer } from "@/src/features/analysis/mock-analyze-answer";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    sessionId,
    questionId,
    finalAnswer,
    inputMode,
    rawTranscript,
  } = body;

  if (!sessionId || !questionId || !finalAnswer) {
    return NextResponse.json(
      {
        ok: false,
        error: "sessionId, questionId and finalAnswer are required",
      },
      { status: 400 }
    );
  }

  const mode = inputMode === "VOICE" ? "VOICE" : "TEXT";

  const attempt = await prisma.attempt.create({
    data: {
      sessionId,
      questionId,
      inputMode: mode,
      finalAnswer,
      rawTranscript: mode === "VOICE" ? rawTranscript ?? null : null,
    },
  });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json(
      {
        ok: false,
        error: "Question not found",
      },
      { status: 404 }
    );
  }

  const reviewItem = await prisma.reviewItem.create({
    data: {
      attemptId: attempt.id,
      questionId: question.id,
      questionTextSnapshot: question.questionText,
      referenceAnswerSnapshot: question.referenceAnswer,
      keyPointsSnapshot: question.keyPoints as unknown as Prisma.InputJsonValue,
      topicSlug: question.topicSlug,
      language: question.language,
    },
    select: {
      id: true,
      status: true,
      addedAt: true,
    },
  });

  const analysis = mockAnalyzeAnswer({
    questionText: question.questionText,
    referenceAnswer: question.referenceAnswer,
    finalAnswer,
  });

  const updatedAttempt = await prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      technicalScore: analysis.technicalScore,
      grammarScore: analysis.grammarScore,
      feedbackJson: analysis.feedbackJson as unknown as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      sessionId: true,
      questionId: true,
      inputMode: true,
      finalAnswer: true,
      rawTranscript: true,
      technicalScore: true,
      grammarScore: true,
      feedbackJson: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      attempt: updatedAttempt,
      reviewItem,
    },
  });
}