/**
 * CartesiaTTSProvider — server-side only.
 * Reads CARTESIA_API_KEY from environment. Never call from client code.
 */

export const CARTESIA_API_VERSION = "2026-08-14";
export const CARTESIA_TTS_MODEL = "sonic-3.6";
export const CARTESIA_STT_MODEL = "ink-2";
export const CARTESIA_BASE_URL = "https://api.cartesia.ai";
export const CARTESIA_WS_BASE_URL = "wss://api.cartesia.ai";

/** Well-known Cartesia voice IDs for interviewer personas */
export const CARTESIA_VOICE_IDS = {
  // Marcus — male, authoritative engineering director voice
  marcus: process.env.CARTESIA_MARCUS_VOICE_ID ?? "694f9389-aac1-45b6-b726-9d9369183238",
  // Elena — female, clear technical architect voice
  elena: process.env.CARTESIA_ELENA_VOICE_ID ?? "bf991597-6135-4318-b45f-3b23c0a12c2d",
} as const;

/** TTS output format: raw PCM so browser AudioContext can decode it directly */
export const TTS_OUTPUT_FORMAT = {
  container: "raw" as const,
  encoding: "pcm_f32le" as const,
  sample_rate: 44100,
};

export function getCartesiaAPIKey(): string {
  const key = process.env.CARTESIA_API_KEY;
  if (!key || key.trim() === "") {
    throw new CartesiaConfigError(
      "CARTESIA_API_KEY is not configured. Add it to .env (server-side only)."
    );
  }
  return key.trim();
}

export function getVoiceIdForGender(gender: "male" | "female"): string {
  return gender === "male" ? CARTESIA_VOICE_IDS.marcus : CARTESIA_VOICE_IDS.elena;
}

export class CartesiaConfigError extends Error {
  code = "CARTESIA_CONFIG_ERROR" as const;
  constructor(message: string) {
    super(message);
    this.name = "CartesiaConfigError";
  }
}

export class CartesiaAuthError extends Error {
  code = "CARTESIA_AUTH_ERROR" as const;
  constructor(message: string) {
    super(message);
    this.name = "CartesiaAuthError";
  }
}

export class CartesiaQuotaError extends Error {
  code = "CARTESIA_QUOTA_ERROR" as const;
  constructor(message: string) {
    super(message);
    this.name = "CartesiaQuotaError";
  }
}

/**
 * Build a Cartesia TTS SSE streaming request.
 * Returns a native fetch Response whose body is the raw audio stream.
 */
export async function streamCartesiaTTS(
  text: string,
  gender: "male" | "female"
): Promise<Response> {
  const apiKey = getCartesiaAPIKey();
  const voiceId = getVoiceIdForGender(gender);

  const body = {
    model_id: CARTESIA_TTS_MODEL,
    transcript: text,
    voice: voiceId,
    output_format: TTS_OUTPUT_FORMAT,
  };

  const response = await fetch(`${CARTESIA_BASE_URL}/tts/sse`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Cartesia-Version": CARTESIA_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new CartesiaAuthError("Cartesia authentication failed. Check CARTESIA_API_KEY.");
  }
  if (response.status === 429) {
    throw new CartesiaQuotaError("Cartesia rate limit or quota exceeded.");
  }
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Cartesia TTS error ${response.status}: ${errorText}`);
  }

  return response;
}

/**
 * Verify the Cartesia API key works by listing voices.
 * Returns { ok: true, voices: [...] } or { ok: false, error: string }
 */
export async function verifyCartesiaKey(): Promise<{
  ok: boolean;
  voices?: { id: string; name: string; gender?: string }[];
  error?: string;
}> {
  try {
    const apiKey = getCartesiaAPIKey();
    const response = await fetch(`${CARTESIA_BASE_URL}/voices`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Cartesia-Version": CARTESIA_API_VERSION,
      },
    });

    if (response.status === 401) {
      return { ok: false, error: "Authentication failed — invalid API key." };
    }
    if (!response.ok) {
      return { ok: false, error: `Cartesia API returned HTTP ${response.status}` };
    }

    const data = await response.json();
    const voices = Array.isArray(data) ? data : (data.voices ?? []);
    return {
      ok: true,
      voices: voices.map((v: { id: string; name: string; gender?: string }) => ({
        id: v.id,
        name: v.name,
        gender: v.gender,
      })),
    };
  } catch (err: unknown) {
    if (err instanceof CartesiaConfigError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: String(err) };
  }
}
