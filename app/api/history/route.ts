import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/src/db/prisma";

type HistoryAttemptDto = {
  id: string;
  finalAnswer: string;
  inputMode: "TEXT" | "VOICE";
  usedVoice: boolean;
  createdAt: string;
};

type HistoryQuestionGroupDto = {
  questionId: string;
  questionText: string;
  referenceAnswer: string;
  topicSlug: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  latestAttemptAt: string;
  attempts: HistoryAttemptDto[];
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        session: {
          userId: session.user.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        questionKey: true,
        questionTextSnapshot: true,
        referenceAnswerSnapshot: true,
        topicSlug: true,
        language: true,
        difficulty: true,
        finalAnswer: true,
        inputMode: true,
        usedVoice: true,
        createdAt: true,
      },
    });

    const groupsMap = new Map<string, HistoryQuestionGroupDto>();

    for (const attempt of attempts) {
      const existingGroup = groupsMap.get(attempt.questionKey);

      const attemptItem: HistoryAttemptDto = {
        id: attempt.id,
        finalAnswer: attempt.finalAnswer,
        inputMode: attempt.inputMode,
        usedVoice: attempt.usedVoice,
        createdAt: attempt.createdAt.toISOString(),
      };

      if (!existingGroup) {
        groupsMap.set(attempt.questionKey, {
          questionId: attempt.questionKey,
          questionText: attempt.questionTextSnapshot,
          referenceAnswer: attempt.referenceAnswerSnapshot,
          topicSlug: attempt.topicSlug,
          language: attempt.language,
          difficulty: attempt.difficulty,
          latestAttemptAt: attempt.createdAt.toISOString(),
          attempts: [attemptItem],
        });

        continue;
      }

      existingGroup.attempts.push(attemptItem);
    }

    return NextResponse.json({
      ok: true,
      data: Array.from(groupsMap.values()),
    });
  } catch (error) {
    console.error("HISTORY GET ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load history",
      },
      {
        status: 500,
      },
    );
  }
}