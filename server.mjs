/**
 * Veyra Custom Next.js Server
 * 
 * Extends the default Next.js dev server to support:
 * 1. WebSocket upgrade for /api/cartesia/stt-relay
 *    → Relays mic audio to Cartesia Ink-2 STT (server-side, API key never exposed)
 * 
 * Usage:
 *   node server.mjs         (production)
 *   node --watch server.mjs (development, or via npm run dev:ws)
 */

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket as NodeWS } from "ws";

import fs from "fs";

const hasBuild = fs.existsSync(".next/BUILD_ID");
const dev = process.env.NODE_ENV === "development" ? true : (process.env.NODE_ENV === "production" ? false : !hasBuild);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;
const CARTESIA_API_VERSION = "2024-06-10";
const CARTESIA_STT_MODEL = "ink-2";
const CARTESIA_WS_BASE_URL = "wss://api.cartesia.ai";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[Server] Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // WebSocket server for Cartesia STT relay
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "", true);
    console.log("[Server Upgrade] pathname:", pathname);

    if (pathname !== "/api/cartesia/stt-relay") {
      // Don't destroy if it's for HMR or other handlers; only destroy if not handled
      return;
    }

    wss.handleUpgrade(req, socket, head, (clientWs) => {
      console.log("[Server Upgrade] wss.handleUpgrade succeeded, starting relay");
      handleSTTRelay(clientWs);
    });
  });

  function handleSTTRelay(clientWs) {
    if (!CARTESIA_API_KEY) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          message: "Cartesia not configured on this server. Set CARTESIA_API_KEY.",
        })
      );
      clientWs.close();
      return;
    }

    // Connect to Cartesia Ink-2 STT WebSocket with required encoding and sample_rate
    const cartesiaWsUrl = `${CARTESIA_WS_BASE_URL}/stt/turns/websocket?api_key=${encodeURIComponent(CARTESIA_API_KEY)}&model=${CARTESIA_STT_MODEL}&cartesia_version=${CARTESIA_API_VERSION}&encoding=pcm_s16le&sample_rate=16000`;

    let cartesiaWs;
    try {
      cartesiaWs = new NodeWS(cartesiaWsUrl);
    } catch (err) {
      clientWs.send(
        JSON.stringify({ type: "error", message: "Failed to connect to Cartesia STT." })
      );
      clientWs.close();
      return;
    }

    cartesiaWs.on("open", () => {
      // Notify browser that Cartesia is connected and ready
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ type: "ready" }));
      }
    });

    // Cartesia → Browser: relay STT events
    cartesiaWs.on("message", (data) => {
      try {
        if (clientWs.readyState === 1) {
          const text = typeof data === "string" ? data : data.toString("utf-8");
          clientWs.send(text);
        }
      } catch {}
    });

    cartesiaWs.on("error", (err) => {
      console.error("[CartesiaSTTRelay] Cartesia error:", err.message);
      if (clientWs.readyState === 1) {
        clientWs.send(
          JSON.stringify({ type: "error", message: "Cartesia STT connection error: " + err.message })
        );
      }
    });

    cartesiaWs.on("close", (code, reason) => {
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ type: "closed" }));
        clientWs.close();
      }
    });

    // Browser → Cartesia: relay audio data
    clientWs.on("message", (data) => {
      if (cartesiaWs?.readyState === NodeWS.OPEN) {
        cartesiaWs.send(data);
      }
    });

    clientWs.on("close", (code, reason) => {
      console.log("[CartesiaSTTRelay] Client closed:", code, reason?.toString());
      if (cartesiaWs && (cartesiaWs.readyState === NodeWS.OPEN || cartesiaWs.readyState === NodeWS.CONNECTING)) {
        cartesiaWs.close();
      }
    });

    clientWs.on("error", (err) => {
      console.log("[CartesiaSTTRelay] Client error:", err.message);
      if (cartesiaWs && (cartesiaWs.readyState === NodeWS.OPEN || cartesiaWs.readyState === NodeWS.CONNECTING)) {
        cartesiaWs.close();
      }
    });
  }

  httpServer.listen(port, hostname, () => {
    console.log(`[Veyra] Server ready at http://localhost:${port} (mode: ${dev ? "development" : "production"})`);
    console.log(`[Veyra] Cartesia TTS: ${CARTESIA_API_KEY ? "Configured (Sonic-3.6)" : "NOT CONFIGURED"}`);
    console.log(`[Veyra] Cartesia STT: ${CARTESIA_API_KEY ? "Configured (Ink-2, relay active)" : "NOT CONFIGURED"}`);
  });
});
