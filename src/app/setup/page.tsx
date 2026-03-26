"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import PlayerSetup from "@/components/PlayerSetup";
import { useGameState } from "@/hooks/useGameState";
import type { PlayerProfile } from "@/types/index";

export default function SetupPage() {
  const router = useRouter();
  const { dispatch } = useGameState();

  const handleComplete = useCallback(
    (profile: PlayerProfile) => {
      dispatch({ type: "SET_PLAYER", player: profile });
      router.push("/game");
    },
    [dispatch, router],
  );

  return <PlayerSetup onComplete={handleComplete} />;
}
