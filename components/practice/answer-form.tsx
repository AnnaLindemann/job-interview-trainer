"use client";

import { FormEvent, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export type AnswerFormSubmitPayload = {
  inputMode: "TEXT" | "VOICE";
  rawTranscript: string | null;
  finalAnswer: string;
  usedVoice: boolean;
};

type AnswerFormProps = {
  answer: string;
  isSubmitting: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: (payload: AnswerFormSubmitPayload) => void;
};

type InputMode = "TEXT" | "VOICE";
type VoiceState = "idle" | "listening" | "processing" | "ready" | "error";

export function AnswerForm(props: AnswerFormProps) {
  const { answer, isSubmitting, onAnswerChange, onSubmit } = props;

  const [inputMode, setInputMode] = useState<InputMode>("TEXT");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [rawTranscriptValue, setRawTranscriptValue] = useState<string>("");
  const [usedVoice, setUsedVoice] = useState(false);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleStartVoice = async () => {
    if (!browserSupportsSpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      setVoiceState("error");
      return;
    }

    setVoiceError(null);
    resetTranscript();
    setVoiceState("listening");

    try {
      await SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    } catch {
      setVoiceError("Failed to start voice input.");
      setVoiceState("error");
    }
  };

  const handleStopVoice = async () => {
    try {
      setVoiceState("processing");
      await SpeechRecognition.stopListening();

      const normalizedTranscript = transcript.trim();

      if (normalizedTranscript) {
        setUsedVoice(true);

        setRawTranscriptValue((prev) =>
          prev.trim() ? `${prev.trim()} ${normalizedTranscript}` : normalizedTranscript
        );

        const nextAnswer = answer.trim()
          ? `${answer.trim()} ${normalizedTranscript}`
          : normalizedTranscript;

        onAnswerChange(nextAnswer);
      }

      setVoiceState("ready");
    } catch {
      setVoiceError("Failed to stop voice input.");
      setVoiceState("error");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const finalAnswer = answer.trim();

    if (!finalAnswer) {
      return;
    }

    onSubmit({
      inputMode: usedVoice ? "VOICE" : "TEXT",
      rawTranscript: rawTranscriptValue.trim() ? rawTranscriptValue.trim() : null,
      finalAnswer,
      usedVoice,
    });
  };

  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">Your answer</h2>
        <p className="text-sm text-zinc-500">
          Choose text or voice input. Voice text will be added to your answer.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <span className="text-sm font-medium text-zinc-700">Input mode</span>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setInputMode("TEXT")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                inputMode === "TEXT"
                  ? "bg-teal-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Text
            </button>

            <button
              type="button"
              onClick={() => setInputMode("VOICE")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                inputMode === "VOICE"
                  ? "bg-teal-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Voice
            </button>
          </div>
        </div>

        {inputMode === "TEXT" ? (
          <div className="space-y-2">
            <label htmlFor="answer" className="text-sm font-medium text-zinc-700">
              Answer text
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder="Write your answer here..."
              rows={8}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            {!browserSupportsSpeechRecognition ? (
              <p className="text-sm text-amber-700">
                Voice input is not supported in this browser.
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleStartVoice}
                disabled={
                  voiceState === "listening" || !browserSupportsSpeechRecognition
                }
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start recording
              </button>

              <button
                type="button"
                onClick={handleStopVoice}
                disabled={voiceState !== "listening"}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Stop recording
              </button>
            </div>

            {voiceState === "listening" ? (
              <p className="text-sm text-teal-700">Listening...</p>
            ) : null}

            {voiceState === "processing" ? (
              <p className="text-sm text-zinc-600">Processing...</p>
            ) : null}

            {voiceState === "ready" ? (
              <p className="text-sm text-emerald-700">
                Voice text was added to your answer. You can edit it below.
              </p>
            ) : null}

            {voiceError ? (
              <p className="text-sm text-red-600">{voiceError}</p>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">Live transcript</p>
              <div className="min-h-24 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800">
                {transcript || "Your transcript will appear here..."}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="voice-answer"
                className="text-sm font-medium text-zinc-700"
              >
                Edit your answer
              </label>
              <textarea
                id="voice-answer"
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                placeholder="Your voice transcript will be added here..."
                rows={8}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !answer.trim()}
          className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Submit answer"}
        </button>
      </form>
    </section>
  );
}