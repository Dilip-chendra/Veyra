/**
 * Cartesia Health Check API
 * GET /api/cartesia/health
 * 
 * Returns:
 * { 
 *   configured: boolean,
 *   tts: "ok" | "error",
 *   voices: { marcus: { id, name }, elena: { id, name } },
 *   error?: string
 * }
 * 
 * Used by the pre-flight check before starting an interview.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  verifyCartesiaKey,
  CARTESIA_VOICE_IDS,
  CartesiaConfigError,
} from "@/lib/providers/cartesiaTTSProvider";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  // Health check can be queried with or without active session

  const cartesiaApiKey = process.env.CARTESIA_API_KEY;
  if (!cartesiaApiKey) {
    return NextResponse.json({
      configured: false,
      tts: "error",
      error: "CARTESIA_API_KEY is not set on this server.",
      voices: null,
    });
  }

  try {
    const result = await verifyCartesiaKey();

    if (!result.ok) {
      return NextResponse.json({
        configured: true,
        tts: "error",
        error: result.error,
        voices: null,
      });
    }

    // Find configured voice names from the fetched list
    const voices = result.voices ?? [];
    const findVoice = (id: string) => voices.find((v) => v.id === id);

    const marcusVoice = findVoice(CARTESIA_VOICE_IDS.marcus);
    const elenaVoice = findVoice(CARTESIA_VOICE_IDS.elena);

    return NextResponse.json({
      configured: true,
      tts: "ok",
      voices: {
        marcus: {
          id: CARTESIA_VOICE_IDS.marcus,
          name: marcusVoice?.name ?? "Voice ID configured",
          found: !!marcusVoice,
        },
        elena: {
          id: CARTESIA_VOICE_IDS.elena,
          name: elenaVoice?.name ?? "Voice ID configured",
          found: !!elenaVoice,
        },
      },
      totalVoicesAvailable: voices.length,
    });
  } catch (err) {
    if (err instanceof CartesiaConfigError) {
      return NextResponse.json({
        configured: false,
        tts: "error",
        error: err.message,
        voices: null,
      });
    }
    return NextResponse.json({
      configured: true,
      tts: "error",
      error: "Cartesia health check failed: " + (err instanceof Error ? err.message : String(err)),
      voices: null,
    });
  }
}
