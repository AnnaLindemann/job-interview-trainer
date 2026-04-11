"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import {
  AnswerForm,
  type AnswerFormSubmitPayload,
} from "@/components/practice/answer-form";
import { FeedbackCard } from "@/components/practice/feedback-card";
import { PracticeSetupForm } from "@/components/practice/practice-setup-form";
import { QuestionCard } from "@/components/practice/question-card";

type PracticeLanguage = "en" | "de";

type QuestionDto = {
  id: string;
  roleSlug: string;
  topicSlug: string;
  language: PracticeLanguage;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionText: string;
  referenceAnswer: string;
};

type StartPracticeResponse =
  | {
      ok: true;
      data: {
        sessionId: string;
        question: QuestionDto;
      };
    }
  | {
      ok: false;
      error: string;
    };

type RepeatPracticeResponse =
  | {
      ok: true;
      data: {
        sessionId: string;
        question: QuestionDto;
      };
    }
  | {
      ok: false;
      error: string;
    };

type NextQuestionResponse =
  | {
      ok: true;
      data: {
        question: QuestionDto;
      };
    }
  | {
      ok: false;
      error: string;
    };

type FeedbackDto = {
  summary: string;
  strengths: string[];
  improvements: string[];
};

type CreateAttemptResponse =
  | {
      ok: true;
      data: {
        attempt: {
          id: string;
          sessionId: string;
          questionKey: string;
          questionTextSnapshot: string;
          referenceAnswerSnapshot: string;
          roleSlug: string;
          topicSlug: string;
          language: string;
          difficulty: "EASY" | "MEDIUM" | "HARD";
          inputMode: "TEXT" | "VOICE";
          finalAnswer: string;
          rawTranscript: string | null;
          usedVoice: boolean;
          technicalScore: number | null;
          grammarScore: number | null;
          feedbackJson: FeedbackDto | null;
          createdAt: string;
        };
        practicedQuestion: {
          id: string;
          userId: string;
          questionKey: string;
          questionTextSnapshot: string;
          referenceAnswerSnapshot: string;
          roleSlug: string;
          topicSlug: string;
          language: string;
          difficulty: "EASY" | "MEDIUM" | "HARD";
          addedAt: string;
        };
      };
    }
  | {
      ok: false;
      error: string;
    };

type QuestionBankMetaResponse =
  | {
      ok: true;
      data: {
        topics: string[];
        languages: string[];
      };
    }
  | {
      ok: false;
      error: string;
    };

export default function HomePageClient() {
  const searchParams = useSearchParams();

  const [topicSlug, setTopicSlug] = useState("javascript");
  const [language, setLanguage] = useState("en");
  const [topicOptions, setTopicOptions] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDto | null>(
    null,
  );
  const [answer, setAnswer] = useState("");
  const [answerFormResetKey, setAnswerFormResetKey] = useState(0);

  const [attemptResult, setAttemptResult] = useState<{
    attemptId: string;
    technicalScore: number | null;
    grammarScore: number | null;
    feedback: FeedbackDto | null;
    finalAnswer: string;
    referenceAnswer: string;
  } | null>(null);

  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const repeatRequestStartedRef = useRef(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        setIsLoadingMeta(true);

        const response = await fetch("/api/question-bank/meta");
        const result: QuestionBankMetaResponse = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "Failed to load metadata" : result.error);
        }

        setTopicOptions(result.data.topics);
        setLanguageOptions(result.data.languages);

        setTopicSlug((current) =>
          result.data.topics.includes(current)
            ? current
            : (result.data.topics[0] ?? ""),
        );

        setLanguage((current) =>
          result.data.languages.includes(current)
            ? current
            : (result.data.languages[0] ?? ""),
        );
      } catch {
        setError("Failed to load available topics and languages");
      } finally {
        setIsLoadingMeta(false);
      }
    }

    void loadMeta();
  }, []);

  useEffect(() => {
    if (attemptResult && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [attemptResult]);

  useEffect(() => {
    if (isLoadingMeta) {
      return;
    }

    const mode = searchParams.get("mode");
    const repeatRoleSlug = searchParams.get("roleSlug");
    const repeatTopicSlug = searchParams.get("topicSlug");
    const repeatLanguage = searchParams.get("language");
    const repeatQuestionKey = searchParams.get("questionKey");

    if (mode !== "repeat") {
      repeatRequestStartedRef.current = false;
      return;
    }

    if (
      !repeatRoleSlug ||
      !repeatTopicSlug ||
      !repeatLanguage ||
      !repeatQuestionKey
    ) {
      setError("Repeat link is incomplete");
      return;
    }

    const safeRepeatRoleSlug = repeatRoleSlug;
    const safeRepeatTopicSlug = repeatTopicSlug;
    const safeRepeatLanguage = repeatLanguage;
    const safeRepeatQuestionKey = repeatQuestionKey;

    if (repeatRequestStartedRef.current) {
      return;
    }

    repeatRequestStartedRef.current = true;

    async function loadRepeatQuestion() {
      try {
        setIsStarting(true);
        setError(null);
        setAnswer("");
        setAttemptResult(null);
        setAnswerFormResetKey((prev) => prev + 1);

        setTopicSlug(safeRepeatTopicSlug);
        setLanguage(safeRepeatLanguage);

        const response = await fetch("/api/practice/repeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roleSlug: safeRepeatRoleSlug,
            topicSlug: safeRepeatTopicSlug,
            language: safeRepeatLanguage,
            questionKey: safeRepeatQuestionKey,
          }),
        });

        const result: RepeatPracticeResponse = await response.json();

        if (!response.ok || !result.ok) {
          setSessionId(null);
          setCurrentQuestion(null);
          setError(result.ok ? "Failed to repeat question" : result.error);
          return;
        }

        setSessionId(result.data.sessionId);
        setCurrentQuestion(result.data.question);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch {
        setSessionId(null);
        setCurrentQuestion(null);
        setError("Failed to load repeat question");
      } finally {
        setIsStarting(false);
      }
    }

    void loadRepeatQuestion();
  }, [isLoadingMeta, searchParams]);

  async function handleStartPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!topicSlug || !language) {
      setError("Topic and language are required");
      return;
    }

    setIsStarting(true);
    setError(null);
    setAnswer("");
    setAttemptResult(null);
    setAnswerFormResetKey((prev) => prev + 1);

    try {
      const response = await fetch("/api/practice/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleSlug: "junior-fullstack",
          topicSlug,
          language,
        }),
      });

      const result: StartPracticeResponse = await response.json();

      if (!response.ok || !result.ok) {
        setSessionId(null);
        setCurrentQuestion(null);
        setError(result.ok ? "Unknown error" : result.error);
        return;
      }

      setSessionId(result.data.sessionId);
      setCurrentQuestion(result.data.question);
    } catch {
      setSessionId(null);
      setCurrentQuestion(null);
      setError("Failed to start practice session");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleSubmitAnswer(payload: AnswerFormSubmitPayload) {
    if (!sessionId || !currentQuestion) {
      setError("Session or question is missing");
      return;
    }

    if (!payload.finalAnswer.trim()) {
      setError("Answer is required");
      return;
    }

    setIsSubmittingAnswer(true);
    setError(null);
    setAttemptResult(null);

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          inputMode: payload.inputMode,
          rawTranscript: payload.rawTranscript,
          finalAnswer: payload.finalAnswer,
          usedVoice: payload.usedVoice,
        }),
      });

      const result: CreateAttemptResponse = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.ok ? "Unknown error" : result.error);
        return;
      }

      setAttemptResult({
        attemptId: result.data.attempt.id,
        technicalScore: result.data.attempt.technicalScore,
        grammarScore: result.data.attempt.grammarScore,
        feedback: result.data.attempt.feedbackJson,
        finalAnswer: payload.finalAnswer,
        referenceAnswer: currentQuestion.referenceAnswer,
      });

      setAnswer("");
      setAnswerFormResetKey((prev) => prev + 1);
    } catch {
      setError("Failed to save answer");
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  function handleRepeatQuestion() {
    setError(null);
    setAnswer("");
    setAttemptResult(null);
    setAnswerFormResetKey((prev) => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleNextQuestion() {
    if (!sessionId) {
      setError("Session is missing");
      return;
    }

    setIsLoadingNextQuestion(true);
    setError(null);

    try {
      const response = await fetch("/api/practice/next", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      });

      const result: NextQuestionResponse = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.ok ? "Failed to load next question" : result.error);
        return;
      }

      setCurrentQuestion(result.data.question);
      setAnswer("");
      setAttemptResult(null);
      setAnswerFormResetKey((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setError("Failed to load next question");
    } finally {
      setIsLoadingNextQuestion(false);
    }
  }

  const answerFormKey = currentQuestion
    ? `${currentQuestion.id}-${answerFormResetKey}`
    : `empty-${answerFormResetKey}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex rounded-full border border-teal-200 bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 shadow-sm">
                AI Interview Practice
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <InstallAppButton />
                <LogoutButton />
              </div>
            </div>

            <div className="rounded-3xl border border-teal-100 bg-white/90 p-6 shadow-sm sm:p-8">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                  Practice interviews in a softer, cleaner flow
                </h1>
                <p className="text-sm leading-6 text-zinc-600 sm:text-base">
                  Choose a topic, answer one question, and get structured
                  feedback right away.
                </p>
              </div>
            </div>
          </section>

          {isLoadingMeta ? (
            <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm text-zinc-500">
                Loading available topics and languages...
              </p>
            </section>
          ) : (
            <PracticeSetupForm
              topicSlug={topicSlug}
              language={language}
              topicOptions={topicOptions}
              languageOptions={languageOptions}
              isStarting={isStarting}
              onTopicChange={setTopicSlug}
              onLanguageChange={(value) => setLanguage(value)}
              onSubmit={handleStartPractice}
            />
          )}

          {error ? (
            <section className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </section>
          ) : null}

          <QuestionCard question={currentQuestion} />

          {attemptResult ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleRepeatQuestion}
                disabled={isLoadingNextQuestion || isSubmittingAnswer}
                className="w-full rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Repeat question
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isLoadingNextQuestion || isSubmittingAnswer}
                className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingNextQuestion
                  ? "Loading next question..."
                  : "Next question"}
              </button>
            </div>
          ) : null}

          {sessionId && currentQuestion && !attemptResult ? (
            <AnswerForm
              key={answerFormKey}
              answer={answer}
              isSubmitting={isSubmittingAnswer}
              practiceLanguage={currentQuestion.language}
              onAnswerChange={setAnswer}
              onSubmit={handleSubmitAnswer}
            />
          ) : null}

          {!sessionId || !currentQuestion ? (
            <section className="rounded-3xl border border-dashed border-teal-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm text-zinc-500">
                Start a practice session to unlock the first question and the
                answer form.
              </p>
            </section>
          ) : null}

          {attemptResult ? (
            <div ref={feedbackRef}>
              <FeedbackCard
                attemptId={attemptResult.attemptId}
                technicalScore={attemptResult.technicalScore}
                grammarScore={attemptResult.grammarScore}
                feedback={attemptResult.feedback}
                finalAnswer={attemptResult.finalAnswer}
                referenceAnswer={attemptResult.referenceAnswer}
              />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}