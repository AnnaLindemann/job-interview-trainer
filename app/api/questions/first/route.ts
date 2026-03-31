import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/db/prisma";
import { getFirstQuestion } from "@/src/features/questions/get-first-question";

export async function GET(request: NextRequest) {
  console.log("FIRST ROUTE HANDLER STARTED");

  const { searchParams } = new URL(request.url);

  const roleSlug = searchParams.get("roleSlug");
  const topicSlug = searchParams.get("topicSlug");
  const language = searchParams.get("language");

  const count = await prisma.question.count();
  console.log("Question count:", count);
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  if (!roleSlug || !topicSlug || !language) {
    return NextResponse.json(
      {
        ok: false,
        error: "roleSlug, topicSlug and language are required",
      },
      { status: 400 }
    );
  }

  const question = await getFirstQuestion({
    roleSlug,
    topicSlug,
    language,
  });

  console.log("Question result:", question);

  if (!question) {
    return NextResponse.json(
      {
        ok: false,
        error: "No active question found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: question,
  });
}