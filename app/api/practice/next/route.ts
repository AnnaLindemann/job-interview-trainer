import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNextQuestion } from "@/src/features/questions/get-next-question";

type NextQuestionBody = {
  sessionId: string;
};

function isValidBody(value: unknown): value is NextQuestionBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return typeof body.sessionId === "string" && body.sessionId.trim().length > 0;
}

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

    if (!isValidBody(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: "sessionId is required",
        },
        { status: 400 },
      );
    }

    const question = await getNextQuestion({
      sessionId: body.sessionId.trim(),
      userId: session.user.id,
    });

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "No next question found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        question,
      },
    });
  } catch (error) {
    console.error("NEXT QUESTION ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}