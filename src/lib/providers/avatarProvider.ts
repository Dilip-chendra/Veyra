export interface AvatarProviderStatus {
  provider: "threejs_3d_engine" | "tavus" | "heygen" | "simli";
  isConfigured: boolean;
  isActive: boolean;
  statusMessage: string;
}

export class AvatarProviderService {
  public static getAvailableProviders(): AvatarProviderStatus[] {
    const hasTavus = Boolean(process.env.TAVUS_API_KEY);
    const hasHeyGen = Boolean(process.env.HEYGEN_API_KEY);
    const hasSimli = Boolean(process.env.SIMLI_API_KEY);

    return [
      {
        provider: "threejs_3d_engine",
        isConfigured: true,
        isActive: !hasTavus && !hasHeyGen && !hasSimli,
        statusMessage: "Active: High-fidelity procedural 3D Digital Human Engine with 52 ARKit blendshapes, gaze tracking, procedural nods, and audio-driven lip-sync.",
      },
      {
        provider: "tavus",
        isConfigured: hasTavus,
        isActive: hasTavus,
        statusMessage: hasTavus
          ? "Configured: Real-time Tavus digital twin streaming adapter."
          : "This integration requires configuration (set TAVUS_API_KEY in environment or Settings).",
      },
      {
        provider: "heygen",
        isConfigured: hasHeyGen,
        isActive: false,
        statusMessage: hasHeyGen
          ? "Configured: HeyGen Interactive Avatar streaming adapter."
          : "This integration requires configuration (set HEYGEN_API_KEY in environment or Settings).",
      },
      {
        provider: "simli",
        isConfigured: hasSimli,
        isActive: false,
        statusMessage: hasSimli
          ? "Configured: Simli ultra-low-latency avatar WebRTC stream."
          : "This integration requires configuration (set SIMLI_API_KEY in environment or Settings).",
      },
    ];
  }

  public static getActiveProvider(): AvatarProviderStatus {
    const providers = this.getAvailableProviders();
    return providers.find(p => p.isActive) || providers[0];
  }
}
