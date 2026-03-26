import { NextResponse } from "next/server";
import { textToSpeech } from "@/lib/audio";

interface AudioRequestBody {
  text: string;
  lang: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as AudioRequestBody;

  if (!body.text || !body.lang) {
    return NextResponse.json(
      { error: "Missing required fields: text, lang" },
      { status: 400 },
    );
  }

  const audioBuffer = await textToSpeech(body.text, body.lang);
  const base64Audio = audioBuffer.toString("base64");
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

  return NextResponse.json({ audioUrl });
}
