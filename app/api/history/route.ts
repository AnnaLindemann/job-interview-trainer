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

  try {
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
        finalAnswer: true,
        inputMode: true,
        usedVoice: true,
        createdAt: true,
        question: {
          select: {
            id: true,
            questionText: true,
            referenceAnswer: true,
            topicSlug: true,
            language: true,
            difficulty: true,
          },
        },
      },
    });

    const groupsMap = new Map<string, HistoryQuestionGroupDto>();

    for (const attempt of attempts) {
      const existingGroup = groupsMap.get(attempt.question.id);

      const attemptItem: HistoryAttemptDto = {
        id: attempt.id,
        finalAnswer: attempt.finalAnswer,
        inputMode: attempt.inputMode,
        usedVoice: attempt.usedVoice,
        createdAt: attempt.createdAt.toISOString(),
      };

      if (!existingGroup) {
        groupsMap.set(attempt.question.id, {
          questionId: attempt.question.id,
          questionText: attempt.question.questionText,
          referenceAnswer: attempt.question.referenceAnswer,
          topicSlug: attempt.question.topicSlug,
          language: attempt.question.language,
          difficulty: attempt.question.difficulty,
          latestAttemptAt: attempt.createdAt.toISOString(),
          attempts: [attemptItem],
        });

        continue;
      }

      existingGroup.attempts.push(attemptItem);
    }

    const historyItems = Array.from(groupsMap.values());

    return NextResponse.json({
      ok: true,
      data: historyItems,
    });
  } catch (error) {
    console.error("Failed to load history", error);

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