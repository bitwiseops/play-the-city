"use client";

import type { GameState } from "@/types/index";

interface ScoreBarProps {
  gameState: GameState;
}

export default function ScoreBar({ gameState }: ScoreBarProps) {
  const completedCount = gameState.stages.filter((s) => s.completed).length;
  const totalCount = gameState.stages.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="safe-top pointer-events-auto fixed inset-x-0 top-0 z-20 bg-slate-900/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{gameState.city}</p>
        </div>

        <div className="mx-4 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-slate-400">
            {completedCount}/{totalCount} tappe
          </p>
        </div>

        <div className="flex items-center gap-1 text-right">
          <span className="text-xl font-bold text-yellow-400">
            {gameState.score}
          </span>
          <span className="text-xs text-slate-400">pt</span>
        </div>
      </div>
    </div>
  );
}
