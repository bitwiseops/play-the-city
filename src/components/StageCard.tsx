"use client";

import { useState, useRef, useCallback } from "react";
import type { GameStage } from "@/types/index";

interface StageCardProps {
  stage: GameStage | null;
  onStartQuiz: () => void;
  onReadStory: () => void;
}

const categoryColors: Record<string, string> = {
  arte: "bg-purple-500",
  food: "bg-orange-500",
  natura: "bg-green-500",
  storia: "bg-amber-600",
  nightlife: "bg-pink-500",
};

const categoryLabels: Record<string, string> = {
  arte: "Arte",
  food: "Food",
  natura: "Natura",
  storia: "Storia",
  nightlife: "Nightlife",
};

export default function StageCard({
  stage,
  onStartQuiz,
  onReadStory,
}: StageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = startY.current - e.changedTouches[0].clientY;
      if (deltaY > 50) {
        setExpanded(true);
      } else if (deltaY < -50) {
        setExpanded(false);
      }
    },
    [],
  );

  if (!stage) {
    return null;
  }

  const { poi, unlocked, completed } = stage;
  const colorClass = categoryColors[poi.category] ?? "bg-slate-500";
  const label = categoryLabels[poi.category] ?? poi.category;

  return (
    <div
      className={`safe-bottom pointer-events-auto fixed inset-x-0 bottom-0 z-20 rounded-t-2xl bg-slate-800 shadow-lg transition-transform duration-300 ${
        expanded ? "translate-y-0" : "translate-y-[calc(100%-8rem)]"
      }`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="drag-handle" />

      <div className="px-4 pb-4">
        {/* Compact header - always visible */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colorClass}`}
          >
            {stage.order}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{poi.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{label}</span>
              {completed && (
                <span className="text-xs text-green-400">Completata</span>
              )}
              {!unlocked && (
                <span className="text-xs text-slate-500">Bloccata</span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        <div
          className={`mt-4 overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            {poi.description}
          </p>

          {unlocked && !completed && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onReadStory}
                className="h-11 flex-1 rounded-xl bg-slate-700 text-base font-medium text-white active:bg-slate-600"
              >
                Storia
              </button>
              <button
                type="button"
                onClick={onStartQuiz}
                className="h-11 flex-1 rounded-xl bg-blue-600 text-base font-medium text-white active:bg-blue-500"
              >
                Quiz
              </button>
            </div>
          )}

          {completed && (
            <button
              type="button"
              onClick={onReadStory}
              className="h-11 w-full rounded-xl bg-slate-700 text-base font-medium text-white active:bg-slate-600"
            >
              Rileggi la storia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
