import type { NextRequest } from "next/server";
import { generateCityPOIs } from "@/lib/city-generator.js";

const VALID_LANGS = new Set(["it", "en", "fr", "es"]);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");
  const lang = searchParams.get("lang") ?? "en";

  if (!name) {
    return Response.json(
      { error: "Missing required query parameter: name" },
      { status: 400 },
    );
  }

  if (!VALID_LANGS.has(lang)) {
    return Response.json(
      { error: `Invalid lang. Supported: ${[...VALID_LANGS].join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const pois = await generateCityPOIs(name, lang);
    return Response.json(pois);
  } catch (err: unknown) {
    console.error("City generation failed:", err);
    return Response.json(
      { error: "Failed to generate city POIs" },
      { status: 500 },
    );
  }
}
