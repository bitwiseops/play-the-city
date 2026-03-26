import { NextResponse } from "next/server";
import { generateStory } from "@/lib/narrative";
import type { POI, PlayerProfile } from "@/types";

interface StoryRequestBody {
  poi: POI;
  profile: PlayerProfile;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as StoryRequestBody;

  if (!body.poi || !body.profile) {
    return NextResponse.json(
      { error: "Missing required fields: poi, profile" },
      { status: 400 },
    );
  }

  const story = await generateStory(body.poi, body.profile);
  return NextResponse.json(story);
}
