import { NextResponse } from "next/server";

import { getQuestionBankMeta } from "@/src/features/questions/question-bank-meta";

export async function GET() {
  try {
    const meta = await getQuestionBankMeta();

    return NextResponse.json({
      ok: true,
      data: meta,
    });
  } catch (error) {
    console.error("QUESTION BANK META ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load question bank metadata",
      },
      { status: 500 },
    );
  }
}