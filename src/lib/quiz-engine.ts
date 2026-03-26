import Anthropic from "@anthropic-ai/sdk";
import type { Quiz, POI, PlayerProfile } from "@/types/index";

const DIFFICULTY_MAP: Record<PlayerProfile["level"], Quiz["difficulty"]> = {
  casual: "easy",
  medium: "medium",
  expert: "hard",
};

const LANGUAGE_LABELS: Record<PlayerProfile["language"], string> = {
  it: "Italian",
  en: "English",
  fr: "French",
  es: "Spanish",
};

function buildSystemPrompt(language: string, difficulty: Quiz["difficulty"]): string {
  return [
    `You are a quiz master for a location-based city exploration game.`,
    `Generate quiz questions based ONLY on verifiable, well-documented facts about the place described.`,
    `Do NOT invent or fabricate historical events, dates, or attributions.`,
    `All questions and answers must be in ${language}.`,
    `Difficulty level: ${difficulty}.`,
    difficulty === "easy"
      ? `For easy: use straightforward questions about well-known facts.`
      : difficulty === "medium"
        ? `For medium: ask about less obvious but still documented details.`
        : `For hard: ask about nuanced historical, architectural, or cultural details that require deeper knowledge.`,
    `Respond ONLY with a valid JSON array of exactly 3 quiz objects. No markdown, no code fences, no extra text.`,
    `Each object must have these fields:`,
    `- "question": string (the quiz question)`,
    `- "options": string[] (exactly 4 answer options)`,
    `- "correctIndex": number (0-based index of the correct option)`,
    `- "curiosity": string (an interesting fact revealed after answering)`,
  ].join("\n");
}

function buildUserPrompt(poi: POI): string {
  return [
    `Generate 3 quiz questions about this place:`,
    `Name: ${poi.name}`,
    `Description: ${poi.description}`,
    `Category: ${poi.category}`,
    poi.source ? `Source/Reference: ${poi.source}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

interface RawQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  curiosity: string;
}

function parseQuizResponse(text: string, poi: POI, difficulty: Quiz["difficulty"]): Quiz[] {
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed: unknown = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("Response is not an array");
  }

  return parsed.map((item: RawQuiz) => ({
    poiId: poi.id,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    curiosity: item.curiosity,
    difficulty,
  }));
}

export async function generateQuizzes(poi: POI, profile: PlayerProfile): Promise<Quiz[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const client = new Anthropic({ apiKey });
  const difficulty = DIFFICULTY_MAP[profile.level];
  const language = LANGUAGE_LABELS[profile.language];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: buildSystemPrompt(language, difficulty),
    messages: [{ role: "user", content: buildUserPrompt(poi) }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude API");
  }

  return parseQuizResponse(textBlock.text, poi, difficulty);
}
