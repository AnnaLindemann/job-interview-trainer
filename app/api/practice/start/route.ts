import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";
import { getFirstQuestion } from "@/src/features/questions/get-first-question";

type StartPracticeBody = {
  roleSlug: string;
  topicSlug: string;
  language: string;
};

function isValidStartPracticeBody(value: unknown): value is StartPracticeBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.roleSlug === "string" &&
    body.roleSlug.trim().length > 0 &&
    typeof body.topicSlug === "string" &&
    body.topicSlug.trim().length > 0 &&
    typeof body.language === "string" &&
    body.language.trim().length > 0
  );
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

    if (!isValidStartPracticeBody(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: "roleSlug, topicSlug and language are required",
        },
        { status: 400 },
      );
    }

    const roleSlug = body.roleSlug.trim();
    const topicSlug = body.topicSlug.trim();
    const language = body.language.trim();

    const question = await getFirstQuestion({
      userId: session.user.id,
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

    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
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
        question,
      },
    });
  } catch (error) {
    console.error("START PRACTICE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}