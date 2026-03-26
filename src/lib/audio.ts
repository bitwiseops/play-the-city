import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

let _client: ElevenLabsClient | undefined;
function getClient(): ElevenLabsClient {
  _client ??= new ElevenLabsClient();
  return _client;
}

const VOICE_IDS: Record<string, string> = {
  it: "IKne3meq5aSn9XLyUdCD", // Italian — Giovanni
  en: "21m00Tcm4TlvDq8ikWAM", // English — Rachel
  fr: "pFZP5JQG7iQjIQuC4Bku", // French — Lily
  es: "GBv7mTt0atIp3Br8iCZE", // Spanish — Thomas
};

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";

export async function textToSpeech(
  text: string,
  lang: string,
): Promise<Buffer> {
  const voiceId = VOICE_IDS[lang] ?? DEFAULT_VOICE;

  const stream = await getClient().textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
  });

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
