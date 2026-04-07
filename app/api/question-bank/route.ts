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
        { status: 401 },
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

    const items = practicedQuestions.map((item) => ({
      practicedQuestionId: item.id,
      questionId: item.questionKey,
      questionText: item.questionTextSnapshot,
      referenceAnswer: item.referenceAnswerSnapshot,
      roleSlug: item.roleSlug,
      topicSlug: item.topicSlug,
      language: item.language,
      difficulty: item.difficulty,
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
      { status: 500 },
    );
  }
}