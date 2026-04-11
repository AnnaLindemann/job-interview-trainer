import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getQuestionBankItemsForUser } from "@/src/features/questions/get-question-bank-items";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const topicSlug = searchParams.get("topicSlug") || undefined;
    const language = searchParams.get("language") || undefined;

    if (!topicSlug && !language) {
      return NextResponse.json(
        {
          ok: false,
          error: "At least one filter is required",
        },
        { status: 400 },
      );
    }

    const items = await getQuestionBankItemsForUser({
      userId: session.user.id,
      topicSlug,
      language,
    });

    return NextResponse.json({
      ok: true,
      data: {
        items,
      },
    });
  } catch (error) {
    console.error("QUESTIONS GET ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}