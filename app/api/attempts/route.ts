import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";
import { analyzeAnswer } from "@/src/features/analysis/analyze-answer";
import { createAttemptSchema } from "@/src/features/attempts/attempt.schemas";
import { findQuestionInContentBank } from "@/src/features/questions/content-question-bank";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 },
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
        { status: 400 },
      );
    }

    const {
      sessionId,
      inputMode,
      rawTranscript,
      finalAnswer,
      usedVoice,
    } = parsed.data;

    const questionKey =
      "questionKey" in parsed.data &&
      typeof parsed.data.questionKey === "string" &&
      parsed.data.questionKey.trim().length > 0
        ? parsed.data.questionKey.trim()
        : "questionId" in parsed.data &&
            typeof parsed.data.questionId === "string" &&
            parsed.data.questionId.trim().length > 0
          ? parsed.data.questionId.trim()
          : "";

    if (!questionKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "questionKey is required",
        },
        { status: 400 },
      );
    }

    const practiceSession = await prisma.practiceSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        userId: true,
        roleSlug: true,
        topicSlug: true,
        language: true,
      },
    });

    if (!practiceSession) {
      return NextResponse.json(
        {
          ok: false,
          error: "Practice session not found",
        },
        { status: 404 },
      );
    }

    if (practiceSession.userId !== session.user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 },
      );
    }

    const question = await findQuestionInContentBank({
      roleSlug: practiceSession.roleSlug,
      topicSlug: practiceSession.topicSlug,
      language: practiceSession.language,
      questionKey,
    });

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "Question not found in content bank",
        },
        { status: 404 },
      );
    }

    const attempt = await prisma.attempt.create({
      data: {
        sessionId,
        questionKey: question.questionKey,
        questionTextSnapshot: question.questionText,
        referenceAnswerSnapshot: question.referenceAnswer,
        roleSlug: question.roleSlug,
        topicSlug: question.topicSlug,
        language: question.language,
        difficulty: question.difficulty,
        inputMode,
        finalAnswer: finalAnswer.trim(),
        usedVoice,
        rawTranscript: usedVoice ? rawTranscript?.trim() ?? null : null,
      },
    });

    const practicedQuestion = await prisma.practicedQuestion.upsert({
      where: {
        userId_roleSlug_topicSlug_language_questionKey: {
          userId: session.user.id,
          roleSlug: question.roleSlug,
          topicSlug: question.topicSlug,
          language: question.language,
          questionKey: question.questionKey,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        questionKey: question.questionKey,
        questionTextSnapshot: question.questionText,
        referenceAnswerSnapshot: question.referenceAnswer,
        roleSlug: question.roleSlug,
        topicSlug: question.topicSlug,
        language: question.language,
        difficulty: question.difficulty,
      },
      select: {
        id: true,
        userId: true,
        questionKey: true,
        questionTextSnapshot: true,
        referenceAnswerSnapshot: true,
        roleSlug: true,
        topicSlug: true,
        language: true,
        difficulty: true,
        addedAt: true,
      },
    });

    const analysis = await analyzeAnswer({
      questionText: question.questionText,
      referenceAnswer: question.referenceAnswer,
      finalAnswer: finalAnswer.trim(),
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
        questionKey: true,
        questionTextSnapshot: true,
        referenceAnswerSnapshot: true,
        roleSlug: true,
        topicSlug: true,
        language: true,
        difficulty: true,
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
      { status: 500 },
    );
  }
}