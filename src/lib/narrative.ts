import Anthropic from "@anthropic-ai/sdk";
import type { POI, PlayerProfile, Story } from "@/types";

let _anthropic: Anthropic | undefined;
function getClient(): Anthropic {
  _anthropic ??= new Anthropic();
  return _anthropic;
}

export async function generateStory(
  poi: POI,
  profile: PlayerProfile,
): Promise<Story> {
  const systemPrompt = buildSystemPrompt(profile);
  const userPrompt = buildUserPrompt(poi, profile);

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return {
    poiId: poi.id,
    text: block.text,
    language: profile.language,
  };
}

function buildSystemPrompt(profile: PlayerProfile): string {
  const langInstructions: Record<PlayerProfile["language"], string> = {
    it: "Scrivi in italiano.",
    en: "Write in English.",
    fr: "Écris en français.",
    es: "Escribe en español.",
  };

  const ageGuidance =
    profile.age < 12
      ? "Use simple language suitable for children."
      : profile.age < 18
        ? "Use vivid but age-appropriate language for teenagers."
        : "Use rich, evocative language for adults.";

  return [
    "You are a storyteller for an immersive city exploration game.",
    "Generate a micro-story (max 150 words) in second person ('You find yourself...', 'Ti trovi davanti a...').",
    "The story must be engaging, atmospheric, and set in the specific location described.",
    ageGuidance,
    langInstructions[profile.language],
    "Output ONLY the story text, no titles or metadata.",
  ].join("\n");
}

function buildUserPrompt(poi: POI, profile: PlayerProfile): string {
  return [
    `Location: ${poi.name}`,
    `Description: ${poi.description}`,
    `Category: ${poi.category}`,
    `Player interests: ${profile.interests.join(", ")}`,
    `Player level: ${profile.level}`,
  ].join("\n");
}
