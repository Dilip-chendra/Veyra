export interface VoiceProviderStatus {
  provider: "cartesia_sonic" | "web_speech_api";
  isConfigured: boolean;
  isActive: boolean;
  statusMessage: string;
}

export class VoiceProviderService {
  public static getAvailableProviders(): VoiceProviderStatus[] {
    const hasCartesia = Boolean(process.env.CARTESIA_API_KEY);

    return [
      {
        provider: "cartesia_sonic",
        isConfigured: hasCartesia,
        isActive: hasCartesia,
        statusMessage: hasCartesia
          ? "Active: Cartesia Sonic-3.6 neural voice streaming."
          : "Not configured: Set CARTESIA_API_KEY (server-side only) to enable.",
      },
      {
        provider: "web_speech_api",
        isConfigured: true,
        isActive: !hasCartesia,
        statusMessage: "Fallback: Native browser speech synthesis (not used when Cartesia is configured).",
      },
    ];
  }
}
