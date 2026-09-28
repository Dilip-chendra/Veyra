export interface STTProviderStatus {
  provider: "cartesia_ink" | "web_speech_recognition";
  isConfigured: boolean;
  isActive: boolean;
  statusMessage: string;
}

export class STTProviderService {
  public static getAvailableProviders(): STTProviderStatus[] {
    const hasCartesia = Boolean(process.env.CARTESIA_API_KEY);

    return [
      {
        provider: "cartesia_ink",
        isConfigured: hasCartesia,
        isActive: hasCartesia,
        statusMessage: hasCartesia
          ? "Active: Cartesia Ink-2 streaming STT with native turn detection."
          : "Not configured: Set CARTESIA_API_KEY (server-side only) to enable.",
      },
      {
        provider: "web_speech_recognition",
        isConfigured: true,
        isActive: !hasCartesia,
        statusMessage: "Fallback: Native browser speech recognition (not used when Cartesia is configured).",
      },
    ];
  }
}
