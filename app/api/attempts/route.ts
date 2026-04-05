import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";
import { analyzeAnswer } from "@/src/features/analysis/analyze-answer";
import { createAttemptSchema } from "@/src/features/attempts/attempt.schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
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

    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!practiceSession) {
      return NextResponse.json(
        {
          ok: false,
          error: "Practice session not found",
        },
        { status: 404 }
      );
    }

    if (practiceSession.userId !== session.user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionText: true,
        referenceAnswer: true,
      },
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

    const practicedQuestion = await prisma.practicedQuestion.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId: question.id,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        questionId: question.id,
      },
      select: {
        id: true,
        userId: true,
        questionId: true,
        addedAt: true,
      },
    });

    const analysis = await analyzeAnswer({
      questionText: question.questionText,
      referenceAnswer: question.referenceAnswer,
      finalAnswer,
    });

    const feedbackJson: Prisma.InputJsonValue = {
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
        feedbackJson,
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
        practicedQuestion,
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