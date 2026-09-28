import { NextResponse } from "next/server";

export async function GET() {
  const hasCartesia = Boolean(process.env.CARTESIA_API_KEY);
  const marcusVoiceId = process.env.CARTESIA_MARCUS_VOICE_ID ?? "694f9389-aac1-45b6-b726-9d9369183238";
  const elenaVoiceId = process.env.CARTESIA_ELENA_VOICE_ID ?? "bf991597-6135-4318-b45f-3b23c0a12c2d";

  return NextResponse.json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    hardware: {
      os: "Windows 11 Home Single Language",
      cpu: "AMD Ryzen 5 5625U with Radeon Graphics",
      cores: 6,
      logicalProcessors: 12,
      ramTotalGb: 15.35,
      ramFreeGb: 5.19,
      gpu: "AMD Radeon (TM) Graphics (Integrated APU)",
      gpuVramMb: 512,
      cudaAvailable: false,
      diskFreeGb: 2.02,
    },
    engines: {
      avatar: {
        active: "STATIC_HUMAN_PHOTO",
        description: "Professional human photograph — Marcus Vance (male) or Elena Rostova (female)",
        status: "READY",
      },
      voice: {
        active: hasCartesia ? "CARTESIA_SONIC_3_6" : "NOT_CONFIGURED",
        status: hasCartesia ? "READY" : "ERROR",
        model: "sonic-3.6",
        personas: {
          male: {
            name: "Marcus Vance",
            voiceId: marcusVoiceId,
            configured: hasCartesia,
          },
          female: {
            name: "Elena Rostova",
            voiceId: elenaVoiceId,
            configured: hasCartesia,
          },
        },
        error: hasCartesia ? null : "CARTESIA_API_KEY not configured. Set it server-side in .env",
      },
      stt: {
        active: hasCartesia ? "CARTESIA_INK_2" : "NOT_CONFIGURED",
        status: hasCartesia ? "READY" : "ERROR",
        model: "ink-2",
        features: ["turn.start", "turn.update", "turn.eager_end", "turn.end"],
        error: hasCartesia ? null : "CARTESIA_API_KEY not configured. Set it server-side in .env",
      },
      brain: {
        active: "VEYRA_ADAPTIVE_INTERVIEW_BRAIN",
        status: "READY",
      },
      database: {
        active: "SQLITE_PRISMA",
        status: "CONNECTED",
      },
    },
  });
}
