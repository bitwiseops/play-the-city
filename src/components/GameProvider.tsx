"use client";

import { useReducer, type ReactNode } from "react";
import { GameContext, gameReducer, initialState } from "@/hooks/useGameState";

export default function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext value={{ state, dispatch }}>
      {children}
    </GameContext>
  );
}
