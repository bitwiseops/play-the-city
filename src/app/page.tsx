"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import CitySearch from "@/components/CitySearch";
import { useGameState } from "@/hooks/useGameState";

export default function Home() {
  const router = useRouter();
  const { dispatch } = useGameState();

  const handleCitySelect = useCallback(
    (city: string) => {
      dispatch({ type: "SET_CITY", city });
      router.push("/setup");
    },
    [dispatch, router],
  );

  return (
    <main className="flex flex-col flex-1 items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Play The City</h1>
          <p className="text-slate-400 text-lg">
            Esplora la citta come un gioco
          </p>
        </div>

        <CitySearch onSelect={handleCitySelect} />
      </div>
    </main>
  );
}
