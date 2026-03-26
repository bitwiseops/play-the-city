"use client";

import { createContext, useContext, type Dispatch } from "react";
import type { GameState, PlayerProfile } from "@/types/index";

type GameAction =
  | { type: "SET_PLAYER"; player: PlayerProfile }
  | { type: "SET_CITY"; city: string }
  | { type: "START_GAME"; state: GameState }
  | { type: "COMPLETE_STAGE"; stageIndex: number; points: number }
  | { type: "NEXT_STAGE" }
  | { type: "RESET" };

const initialState: GameState | null = null;

function gameReducer(
  state: GameState | null,
  action: GameAction,
): GameState | null {
  switch (action.type) {
    case "SET_PLAYER":
      return state
        ? { ...state, player: action.player }
        : {
            player: action.player,
            city: "",
            stages: [],
            currentStage: 0,
            score: 0,
            startedAt: new Date().toISOString(),
          };

    case "SET_CITY":
      return state ? { ...state, city: action.city } : null;

    case "START_GAME":
      return action.state;

    case "COMPLETE_STAGE":
      if (!state) return null;
      return {
        ...state,
        score: state.score + action.points,
        stages: state.stages.map((s, i) =>
          i === action.stageIndex ? { ...s, completed: true } : s,
        ),
      };

    case "NEXT_STAGE":
      if (!state) return null;
      return {
        ...state,
        currentStage: state.currentStage + 1,
        stages: state.stages.map((s, i) =>
          i === state.currentStage + 1 ? { ...s, unlocked: true } : s,
        ),
      };

    case "RESET":
      return null;

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState | null;
  dispatch: Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGameState(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGameState must be used within a GameProvider");
  }
  return ctx;
}

export { gameReducer, initialState };
export type { GameAction };
