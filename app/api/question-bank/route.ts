import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";

export async function GET() {
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

    const practicedQuestions = await prisma.practicedQuestion.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        addedAt: "desc",
      },
      select: {
        id: true,
        addedAt: true,
        question: {
          select: {
            id: true,
            questionText: true,
            referenceAnswer: true,
            roleSlug: true,
            topicSlug: true,
            language: true,
            difficulty: true,
          },
        },
      },
    });

    const items = practicedQuestions.map((item) => ({
      practicedQuestionId: item.id,
      questionId: item.question.id,
      questionText: item.question.questionText,
      referenceAnswer: item.question.referenceAnswer,
      roleSlug: item.question.roleSlug,
      topicSlug: item.question.topicSlug,
      language: item.question.language,
      difficulty: item.question.difficulty,
      addedAt: item.addedAt,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        items,
      },
    });
  } catch (error) {
    console.error("QUESTION BANK GET ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}