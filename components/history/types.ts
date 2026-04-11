export type HistoryAttemptItem = {
  id: string;
  finalAnswer: string;
  inputMode: "TEXT" | "VOICE";
  usedVoice: boolean;
  createdAt: string;
};

export type HistoryQuestionItem = {
  questionKey: string | null;
  questionText: string;
  referenceAnswer: string;
  roleSlug: string;
  topicSlug: string;
  language: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  latestAttemptAt: string;
  attempts: HistoryAttemptItem[];
};

export type HistoryResponse =
  | {
      ok: true;
      data: HistoryQuestionItem[];
    }
  | {
      ok: false;
      error: string;
    };