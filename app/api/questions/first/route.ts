import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getFirstQuestion } from "@/src/features/questions/get-first-question";

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

    const { searchParams } = new URL(request.url);

    const roleSlug = searchParams.get("roleSlug")?.trim();
    const topicSlug = searchParams.get("topicSlug")?.trim();
    const language = searchParams.get("language")?.trim();

    if (!roleSlug || !topicSlug || !language) {
      return NextResponse.json(
        {
          ok: false,
          error: "roleSlug, topicSlug and language are required",
        },
        { status: 400 },
      );
    }

    const question = await getFirstQuestion({
      roleSlug,
      topicSlug,
      language,
    });

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "No active question found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: question,
    });
  } catch (error) {
    console.error("FIRST QUESTION ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}