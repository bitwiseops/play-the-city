"use client";

import { useCallback, useState } from "react";
import type { Interest, PlayerProfile } from "@/types/index";

interface PlayerSetupProps {
  onComplete: (profile: PlayerProfile) => void;
}

const INTERESTS: { id: Interest; label: string; icon: string }[] = [
  { id: "arte", label: "Arte", icon: "\uD83C\uDFA8" },
  { id: "food", label: "Food", icon: "\uD83C\uDF55" },
  { id: "natura", label: "Natura", icon: "\uD83C\uDF3F" },
  { id: "storia", label: "Storia", icon: "\uD83C\uDFDB\uFE0F" },
  { id: "nightlife", label: "Nightlife", icon: "\uD83C\uDF19" },
];

const LANGUAGES = [
  { code: "it" as const, label: "Italiano" },
  { code: "en" as const, label: "English" },
  { code: "fr" as const, label: "Francais" },
  { code: "es" as const, label: "Espanol" },
];

const LEVELS = [
  {
    id: "casual" as const,
    label: "Casual",
    desc: "Vuoi divertirti senza troppo impegno",
  },
  {
    id: "medium" as const,
    label: "Medium",
    desc: "Ti piace imparare cose nuove",
  },
  {
    id: "expert" as const,
    label: "Expert",
    desc: "Sei un appassionato di cultura",
  },
];

export default function PlayerSetup({ onComplete }: PlayerSetupProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [language, setLanguage] = useState<PlayerProfile["language"]>("it");
  const [level, setLevel] = useState<PlayerProfile["level"]>("casual");

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 0:
        return name.trim().length > 0 && Number(age) > 0;
      case 1:
        return interests.length > 0;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, name, age, interests]);

  const handleNext = useCallback(() => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        name: name.trim(),
        age: Number(age),
        interests,
        language,
        level,
      });
    }
  }, [step, name, age, interests, language, level, onComplete]);

  const toggleInterest = useCallback((interest: Interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-blue-500" : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Step 0: Name + Age */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Chi sei?</h2>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm text-slate-400">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
                className="px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="age" className="text-sm text-slate-400">
                Eta
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="La tua eta"
                min="1"
                max="120"
                className="px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        )}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Cosa ti interessa?</h2>
            <p className="text-slate-400">Seleziona uno o piu interessi</p>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleInterest(id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl border text-left transition-colors ${
                    interests.includes(id)
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Language */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Lingua</h2>
            <p className="text-slate-400">In che lingua vuoi giocare?</p>
            <div className="flex flex-col gap-3">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-4 py-4 rounded-xl border text-left transition-colors ${
                    language === code
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Level */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Livello culturale</h2>
            <p className="text-slate-400">Quanto sei esperto?</p>
            <div className="flex flex-col gap-3">
              {LEVELS.map(({ id, label, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLevel(id)}
                  className={`px-4 py-4 rounded-xl border text-left transition-colors ${
                    level === id
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <span className="font-medium block">{label}</span>
                  <span className="text-sm text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-6 py-4 rounded-xl border border-slate-700 text-slate-300 font-medium transition-colors hover:bg-slate-800"
          >
            Indietro
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance()}
          className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {step < 3 ? "Avanti" : "Inizia"}
        </button>
      </div>
    </div>
  );
}
