import { generateQuizzes } from "@/lib/quiz-engine";
import type { POI, PlayerProfile } from "@/types/index";

interface QuizRequestBody {
  poi: POI;
  profile: PlayerProfile;
}

function isValidPOI(value: unknown): value is POI {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    typeof obj.category === "string" &&
    typeof obj.latitude === "number" &&
    typeof obj.longitude === "number" &&
    typeof obj.source === "string"
  );
}

function isValidProfile(value: unknown): value is PlayerProfile {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.age === "number" &&
    Array.isArray(obj.interests) &&
    typeof obj.language === "string" &&
    ["it", "en", "fr", "es"].includes(obj.language as string) &&
    typeof obj.level === "string" &&
    ["casual", "medium", "expert"].includes(obj.level as string)
  );
}

export async function POST(request: Request) {
  let body: QuizRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidPOI(body.poi)) {
    return Response.json({ error: "Invalid or missing 'poi' field" }, { status: 400 });
  }

  if (!isValidProfile(body.profile)) {
    return Response.json({ error: "Invalid or missing 'profile' field" }, { status: 400 });
  }

  try {
    const quizzes = await generateQuizzes(body.poi, body.profile);
    return Response.json(quizzes);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    const message = error instanceof Error ? error.message : "Quiz generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
