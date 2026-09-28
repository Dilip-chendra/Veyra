/**
 * Cartesia STT WebSocket Relay — server-side only.
 * 
 * GET /api/cartesia/stt-relay (WebSocket upgrade)
 * 
 * Architecture:
 *   Browser → WebSocket → /api/cartesia/stt-relay (our server)
 *   Our server → WebSocket → wss://api.cartesia.ai/stt/turns/websocket?api_key=... (Cartesia)
 *   Our server relays audio data: Browser → Cartesia
 *   Our server relays events: Cartesia → Browser
 * 
 * This keeps CARTESIA_API_KEY 100% server-side.
 * 
 * Events proxied from Cartesia to browser:
 *   { type: "turn.start" }
 *   { type: "turn.update", transcript: "..." }
 *   { type: "turn.eager_end", transcript: "..." }
 *   { type: "turn.end", transcript: "..." }
 *   { type: "error", message: "..." }
 *   { type: "ready" }   ← sent by our server when Cartesia connection is established
 */

import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  getCartesiaAPIKey,
  CARTESIA_API_VERSION,
  CARTESIA_STT_MODEL,
  CARTESIA_WS_BASE_URL,
  CartesiaConfigError,
} from "@/lib/providers/cartesiaTTSProvider";

export const runtime = "nodejs";

// Next.js 15 WebSocket upgrade handler
export async function GET(req: NextRequest) {
  // Verify session
  const session = await getSessionFromRequest(req);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if this is a WebSocket upgrade request
  const upgradeHeader = req.headers.get("upgrade");
  if (upgradeHeader !== "websocket") {
    return new Response(
      JSON.stringify({ error: "This endpoint requires a WebSocket connection." }),
      { status: 426, headers: { "Content-Type": "application/json" } }
    );
  }

  let apiKey: string;
  try {
    apiKey = getCartesiaAPIKey();
  } catch (err) {
    if (err instanceof CartesiaConfigError) {
      return new Response(
        JSON.stringify({ error: "Cartesia not configured on this server." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    throw err;
  }

  // Use Node.js WebSocket upgrade via the socket hack
  // Next.js 15 exposes the raw socket via (req as any).socket
  const socket = (req as unknown as { socket: import("net").Socket }).socket;
  if (!socket) {
    return new Response("WebSocket upgrade failed — no raw socket.", { status: 500 });
  }

  // Dynamic import ws to avoid bundler issues
  const { WebSocket: NodeWS } = await import("ws");

  // Parse the upgrade manually and do the handshake
  const { createServer } = await import("http");
  const { WebSocketServer } = await import("ws");

  // Build Cartesia STT WebSocket URL with API key
  const cartesiaWsUrl = `${CARTESIA_WS_BASE_URL}/stt/turns/websocket?api_key=${encodeURIComponent(apiKey)}&model=${CARTESIA_STT_MODEL}&cartesia_version=${CARTESIA_API_VERSION}`;

  // This pattern works in Next.js with custom server or standalone mode
  // For standard Next.js dev mode we use the socket directly
  const wss = new WebSocketServer({ noServer: true });

  wss.handleUpgrade(req as unknown as import("http").IncomingMessage, socket, Buffer.alloc(0), (clientWs) => {
    let cartesiaWs: InstanceType<typeof NodeWS> | null = null;

    // Connect to Cartesia
    try {
      cartesiaWs = new NodeWS(cartesiaWsUrl);
    } catch (err) {
      clientWs.send(JSON.stringify({ type: "error", message: "Failed to connect to Cartesia STT." }));
      clientWs.close();
      return;
    }

    cartesiaWs.on("open", () => {
      clientWs.send(JSON.stringify({ type: "ready" }));
    });

    cartesiaWs.on("message", (data: Buffer | string) => {
      try {
        const text = typeof data === "string" ? data : data.toString("utf-8");
        if (clientWs.readyState === 1 /* OPEN */) {
          clientWs.send(text);
        }
      } catch {
        // ignore relay errors
      }
    });

    cartesiaWs.on("error", (err) => {
      console.error("[CartesiaSTTRelay] Cartesia WS error:", err.message);
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ type: "error", message: "Cartesia STT connection error." }));
      }
    });

    cartesiaWs.on("close", () => {
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ type: "closed" }));
        clientWs.close();
      }
    });

    // Browser → Cartesia relay
    clientWs.on("message", (data: Buffer | string) => {
      if (cartesiaWs?.readyState === NodeWS.OPEN) {
        cartesiaWs.send(data);
      }
    });

    clientWs.on("close", () => {
      cartesiaWs?.close();
    });

    clientWs.on("error", () => {
      cartesiaWs?.close();
    });
  });

  // Return 101 Switching Protocols — the wss.handleUpgrade does the socket writing
  return new Response(null, { status: 101 });
}
