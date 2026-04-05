import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";

type RouteContext = {
  params: Promise<{
    practicedQuestionId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
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

    const { practicedQuestionId } = await context.params;

    const practicedQuestion = await prisma.practicedQuestion.findUnique({
      where: {
        id: practicedQuestionId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!practicedQuestion) {
      return NextResponse.json(
        {
          ok: false,
          error: "Question bank item not found",
        },
        { status: 404 }
      );
    }

    if (practicedQuestion.userId !== session.user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 }
      );
    }

    await prisma.practicedQuestion.delete({
      where: {
        id: practicedQuestionId,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        deletedId: practicedQuestionId,
      },
    });
  } catch (error) {
    console.error("QUESTION BANK DELETE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}