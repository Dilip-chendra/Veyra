/**
 * Cartesia TTS API Route — server-side audio proxy.
 * 
 * POST /api/cartesia/tts
 * Body: { text: string; gender: "male" | "female" }
 * Response: audio/x-raw PCM stream (44100Hz, f32le, mono)
 * 
 * The CARTESIA_API_KEY is read server-side only — never exposed to browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  streamCartesiaTTS,
  CartesiaConfigError,
  CartesiaAuthError,
  CartesiaQuotaError,
} from "@/lib/providers/cartesiaTTSProvider";

export const runtime = "nodejs"; // Required for fetch streaming

export async function POST(req: NextRequest) {
  // Auth check — only authenticated users can speak
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let text: string;
  let gender: "male" | "female";

  try {
    const body = await req.json();
    text = (body.text ?? "").trim();
    gender = body.gender === "male" ? "male" : "female";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!text || text.length === 0) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (text.length > 4000) {
    return NextResponse.json({ error: "text too long (max 4000 chars)" }, { status: 400 });
  }

  try {
    const cartesiaResponse = await streamCartesiaTTS(text, gender);

    // Stream the SSE response body directly to the browser
    // The browser will receive raw PCM audio chunks via Server-Sent Events
    return new Response(cartesiaResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store",
        "Transfer-Encoding": "chunked",
        "X-Cartesia-Gender": gender,
      },
    });
  } catch (err) {
    if (err instanceof CartesiaConfigError) {
      return NextResponse.json(
        { error: "Cartesia not configured on this server. Contact the administrator." },
        { status: 503 }
      );
    }
    if (err instanceof CartesiaAuthError) {
      return NextResponse.json(
        { error: "Cartesia authentication failed. The API key may be invalid or expired." },
        { status: 502 }
      );
    }
    if (err instanceof CartesiaQuotaError) {
      return NextResponse.json(
        { error: "Cartesia quota or rate limit reached. Please wait a moment." },
        { status: 429 }
      );
    }
    console.error("[CartesiaTTS] Unexpected error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Voice synthesis unavailable. Please retry." },
      { status: 500 }
    );
  }
}
