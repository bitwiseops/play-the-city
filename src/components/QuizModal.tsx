"use client";

import { useState, useCallback } from "react";
import type { Quiz } from "@/types/index";

interface QuizModalProps {
  quiz: Quiz;
  onClose: (correct: boolean) => void;
}

type AnswerState = "idle" | "correct" | "wrong";

export default function QuizModal({ quiz, onClose }: QuizModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<AnswerState>("idle");

  const handleAnswer = useCallback(
    (index: number) => {
      if (state !== "idle") return;
      setSelected(index);
      const isCorrect = index === quiz.correctIndex;
      setState(isCorrect ? "correct" : "wrong");

      setTimeout(
        () => {
          onClose(isCorrect);
        },
        isCorrect ? 1500 : 2500,
      );
    },
    [state, quiz.correctIndex, onClose],
  );

  const optionStyle = (index: number) => {
    const base =
      "flex h-14 w-full items-center justify-center rounded-xl text-base font-medium transition-colors";

    if (state === "idle") {
      return `${base} bg-slate-700 text-white active:bg-slate-600`;
    }
    if (index === quiz.correctIndex) {
      return `${base} bg-green-600 text-white`;
    }
    if (index === selected && state === "wrong") {
      return `${base} bg-red-600 text-white`;
    }
    return `${base} bg-slate-700/50 text-slate-400`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm">
      <div className="safe-top" />

      {/* Close button */}
      <div className="flex justify-end px-4 py-3">
        <button
          type="button"
          onClick={() => onClose(false)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-xl text-slate-400"
          aria-label="Chiudi"
        >
          &times;
        </button>
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col justify-center px-6">
        <p className="mb-2 text-center text-sm text-slate-400">
          Difficolt&agrave;: {quiz.difficulty}
        </p>
        <h2 className="mb-8 text-center text-xl font-bold leading-snug">
          {quiz.question}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {quiz.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAnswer(index)}
              disabled={state !== "idle"}
              className={optionStyle(index)}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {state !== "idle" && (
          <div className="mt-6 rounded-xl bg-slate-800 p-4 text-center">
            {state === "correct" ? (
              <p className="text-base font-medium text-green-400">
                Corretto!
              </p>
            ) : (
              <p className="text-base font-medium text-red-400">
                Sbagliato! La risposta era:{" "}
                {quiz.options[quiz.correctIndex]}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-300">{quiz.curiosity}</p>
          </div>
        )}
      </div>

      <div className="safe-bottom" />
    </div>
  );
}
