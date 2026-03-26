"use client";

import { useState, useCallback } from "react";
import GameMap from "@/components/GameMap";
import ScoreBar from "@/components/ScoreBar";
import StageCard from "@/components/StageCard";
import QuizModal from "@/components/QuizModal";
import StoryModal from "@/components/StoryModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { GameState, GameStage } from "@/types/index";

// Demo data for development - will be replaced with real API data
const DEMO_STATE: GameState = {
  player: {
    name: "Esploratore",
    age: 25,
    interests: ["arte", "storia"],
    language: "it",
    level: "casual",
  },
  city: "Roma",
  stages: [
    {
      order: 1,
      poi: {
        id: "colosseo",
        name: "Colosseo",
        description:
          "L'anfiteatro Flavio, simbolo di Roma nel mondo. Costruito in soli 8 anni, poteva ospitare fino a 50.000 spettatori.",
        category: "storia",
        latitude: 41.8902,
        longitude: 12.4922,
        source: "demo",
      },
      quiz: {
        poiId: "colosseo",
        question: "In quanti anni fu costruito il Colosseo?",
        options: ["4 anni", "8 anni", "15 anni", "20 anni"],
        correctIndex: 1,
        curiosity:
          "Il Colosseo fu completato nell'80 d.C. sotto l'imperatore Tito.",
        difficulty: "easy",
      },
      story: {
        poiId: "colosseo",
        text: "Ti trovi davanti al pi\u00f9 grande anfiteatro mai costruito. Immagina le grida della folla, il rumore delle spade...",
        language: "it",
      },
      unlocked: true,
      completed: false,
    },
    {
      order: 2,
      poi: {
        id: "fontana-trevi",
        name: "Fontana di Trevi",
        description:
          "La pi\u00f9 grande e famosa fontana di Roma, capolavoro del barocco.",
        category: "arte",
        latitude: 41.9009,
        longitude: 12.4833,
        source: "demo",
      },
      quiz: {
        poiId: "fontana-trevi",
        question:
          "Cosa succede secondo la leggenda se lanci una moneta nella Fontana di Trevi?",
        options: [
          "Diventi ricco",
          "Tornerai a Roma",
          "Trovi l'amore",
          "Avrai fortuna",
        ],
        correctIndex: 1,
        curiosity:
          "Ogni giorno vengono raccolti circa 3.000 euro in monete dalla fontana.",
        difficulty: "easy",
      },
      story: {
        poiId: "fontana-trevi",
        text: "L'acqua scorre maestosa tra le sculture di Nettuno. Da secoli, i visitatori lanciano monetine esprimendo un desiderio.",
        language: "it",
      },
      unlocked: false,
      completed: false,
    },
    {
      order: 3,
      poi: {
        id: "trastevere",
        name: "Trastevere",
        description:
          "Il quartiere pi\u00f9 caratteristico di Roma, con le sue stradine e la vita notturna.",
        category: "food",
        latitude: 41.8869,
        longitude: 12.4699,
        source: "demo",
      },
      quiz: {
        poiId: "trastevere",
        question: "Qual \u00e8 il piatto tipico romano?",
        options: ["Carbonara", "Pesto", "Rag\u00f9", "Piadina"],
        correctIndex: 0,
        curiosity:
          "La vera carbonara romana si prepara solo con guanciale, pecorino, uova e pepe.",
        difficulty: "medium",
      },
      story: {
        poiId: "trastevere",
        text: "Le stradine di Trastevere si animano la sera. L'odore di cacio e pepe si mescola al suono delle chitarre.",
        language: "it",
      },
      unlocked: false,
      completed: false,
    },
  ],
  currentStage: 1,
  score: 0,
  startedAt: new Date().toISOString(),
};

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>(DEMO_STATE);
  const [selectedStageOrder, setSelectedStageOrder] = useState<number | null>(
    gameState.currentStage,
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const { position } = useGeolocation();

  const selectedStage: GameStage | null =
    gameState.stages.find((s) => s.order === selectedStageOrder) ?? null;

  const handleSelectStage = useCallback((order: number) => {
    setSelectedStageOrder(order);
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (selectedStage?.unlocked && !selectedStage.completed) {
      setShowQuiz(true);
    }
  }, [selectedStage]);

  const handleReadStory = useCallback(() => {
    if (selectedStage) {
      setShowStory(true);
    }
  }, [selectedStage]);

  const handleQuizClose = useCallback(
    (correct: boolean) => {
      setShowQuiz(false);

      if (correct && selectedStage) {
        setGameState((prev) => {
          const newStages = prev.stages.map((s) => {
            if (s.order === selectedStage.order) {
              return { ...s, completed: true };
            }
            // Unlock next stage
            if (s.order === selectedStage.order + 1) {
              return { ...s, unlocked: true };
            }
            return s;
          });

          return {
            ...prev,
            stages: newStages,
            score: prev.score + (selectedStage.quiz.difficulty === "easy" ? 10 : selectedStage.quiz.difficulty === "medium" ? 20 : 30),
            currentStage: Math.min(
              selectedStage.order + 1,
              prev.stages.length,
            ),
          };
        });
      }
    },
    [selectedStage],
  );

  const handleStoryClose = useCallback(() => {
    setShowStory(false);
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {/* Full-screen map */}
      <GameMap
        stages={gameState.stages}
        selectedStage={selectedStageOrder}
        playerPosition={position}
        onSelectStage={handleSelectStage}
      />

      {/* UI overlays */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <ScoreBar gameState={gameState} />
        <StageCard
          stage={selectedStage}
          onStartQuiz={handleStartQuiz}
          onReadStory={handleReadStory}
        />
      </div>

      {/* Modals */}
      {showQuiz && selectedStage && (
        <QuizModal quiz={selectedStage.quiz} onClose={handleQuizClose} />
      )}

      {showStory && selectedStage && (
        <StoryModal
          story={selectedStage.story}
          poi={selectedStage.poi}
          onClose={handleStoryClose}
        />
      )}
    </main>
  );
}
