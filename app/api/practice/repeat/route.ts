import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";
import { findQuestionInContentBank } from "@/src/features/questions/content-question-bank";

type RepeatPracticeRequestBody = {
  roleSlug?: string;
  topicSlug?: string;
  language?: string;
  questionKey?: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = (await request.json()) as RepeatPracticeRequestBody;

    const roleSlug =
      typeof body.roleSlug === "string" ? body.roleSlug.trim() : "";
    const topicSlug =
      typeof body.topicSlug === "string" ? body.topicSlug.trim() : "";
    const language =
      typeof body.language === "string" ? body.language.trim() : "";
    const questionKey =
      typeof body.questionKey === "string" ? body.questionKey.trim() : "";

    if (!roleSlug || !topicSlug || !language || !questionKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "roleSlug, topicSlug, language, and questionKey are required",
        },
        {
          status: 400,
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Authenticated user was not found in database",
        },
        {
          status: 401,
        },
      );
    }

    const question = await findQuestionInContentBank({
      roleSlug,
      topicSlug,
      language,
      questionKey,
    });

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "Question not found",
        },
        {
          status: 404,
        },
      );
    }

    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: user.id,
        roleSlug,
        topicSlug,
        language,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        sessionId: practiceSession.id,
        question: {
          id: question.questionKey,
          roleSlug: question.roleSlug,
          topicSlug: question.topicSlug,
          language: question.language,
          difficulty: question.difficulty,
          questionText: question.questionText,
          referenceAnswer: question.referenceAnswer,
        },
      },
    });
  } catch (error) {
    console.error("REPEAT PRACTICE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to repeat question",
      },
      {
        status: 500,
      },
    );
  }
}