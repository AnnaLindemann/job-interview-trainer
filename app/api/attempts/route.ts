import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/src/db/prisma";
import { analyzeAnswer } from "@/src/features/analysis/analyze-answer";
import { createAttemptSchema } from "@/src/features/attempts/attempt.schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createAttemptSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      return NextResponse.json(
        {
          ok: false,
          error: firstIssue?.message ?? "Invalid request body",
        },
        { status: 400 }
      );
    }

    const {
      sessionId,
      questionId,
      inputMode,
      rawTranscript,
      finalAnswer,
      usedVoice,
    } = parsed.data;

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

    const attempt = await prisma.attempt.create({
      data: {
        sessionId,
        questionId,
        inputMode,
        finalAnswer,
        usedVoice,
        rawTranscript: usedVoice ? rawTranscript ?? null : null,
      },
    });

    const existingReviewItem = await prisma.reviewItem.findFirst({
      where: {
        questionId: question.id,
      },
      select: {
        id: true,
        status: true,
        addedAt: true,
      },
    });

    const reviewItem =
      existingReviewItem ??
      (await prisma.reviewItem.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          questionTextSnapshot: question.questionText,
          referenceAnswerSnapshot: question.referenceAnswer,
          keyPointsSnapshot:
            question.keyPoints as unknown as Prisma.InputJsonValue,
          topicSlug: question.topicSlug,
          language: question.language,
        },
        select: {
          id: true,
          status: true,
          addedAt: true,
        },
      }));

  const analysis = await analyzeAnswer({
  questionText: question.questionText,
  referenceAnswer: question.referenceAnswer,
  finalAnswer,
});

    const feedbackJson = {
      summary: analysis.summary,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
    };

    const updatedAttempt = await prisma.attempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        technicalScore: analysis.technicalScore,
        grammarScore: analysis.grammarScore,
        feedbackJson: feedbackJson as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        sessionId: true,
        questionId: true,
        inputMode: true,
        usedVoice: true,
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
  } catch (error) {
    console.error("ATTEMPT ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}