import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/db/prisma";
import { getFirstQuestion } from "@/src/features/questions/get-first-question";

export async function POST(request: NextRequest) {
  console.log("START PRACTICE SESSION");

  const body = await request.json();

  const { roleSlug, topicSlug, language } = body;

  if (!roleSlug || !topicSlug || !language) {
    return NextResponse.json(
      {
        ok: false,
        error: "roleSlug, topicSlug and language are required",
      },
      { status: 400 }
    );
  }


  const session = await prisma.practiceSession.create({
    data: {
      roleSlug,
      topicSlug,
      language,
    },
  });

  console.log("Session created:", session.id);

 
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
      { status: 404 }
    );
  }


  return NextResponse.json({
    ok: true,
    data: {
      sessionId: session.id,
      question,
    },
  });
}