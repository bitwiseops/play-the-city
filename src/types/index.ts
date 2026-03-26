// ── Profilo giocatore ──
export interface PlayerProfile {
  name: string;
  age: number;
  interests: Interest[];
  language: "it" | "en" | "fr" | "es";
  level: "casual" | "medium" | "expert";
}

export type Interest = "arte" | "food" | "natura" | "storia" | "nightlife";

// ── Punto di interesse ──
export interface POI {
  id: string;
  name: string;
  description: string;
  category: Interest;
  latitude: number;
  longitude: number;
  source: string;
  imageUrl?: string;
}

// ── Quiz ──
export interface Quiz {
  poiId: string;
  question: string;
  options: string[];
  correctIndex: number;
  curiosity: string;
  difficulty: "easy" | "medium" | "hard";
}

// ── Micro-storia narrativa ──
export interface Story {
  poiId: string;
  text: string;
  audioUrl?: string;
  language: string;
}

// ── Tappa di gioco ──
export interface GameStage {
  order: number;
  poi: POI;
  quiz: Quiz;
  story: Story;
  unlocked: boolean;
  completed: boolean;
}

// ── Stato partita ──
export interface GameState {
  player: PlayerProfile;
  city: string;
  stages: GameStage[];
  currentStage: number;
  score: number;
  startedAt: string;
}
