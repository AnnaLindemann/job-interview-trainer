import { NextRequest, NextResponse } from "next/server";

import { getNextQuestion } from "@/src/features/questions/get-next-question";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "sessionId is required",
        },
        { status: 400 }
      );
    }

    const question = await getNextQuestion({ sessionId });

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "No next question found",
        },
        { status: 404 }
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
      { status: 500 }
    );
  }
}