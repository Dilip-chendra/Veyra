export interface VoiceProviderStatus {
  provider: "web_speech_api" | "elevenlabs" | "openai_tts";
  isConfigured: boolean;
  isActive: boolean;
  statusMessage: string;
}

export class VoiceProviderService {
  public static getAvailableProviders(): VoiceProviderStatus[] {
    const hasElevenLabs = Boolean(process.env.ELEVENLABS_API_KEY);
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

    return [
      {
        provider: "web_speech_api",
        isConfigured: true,
        isActive: !hasElevenLabs && !hasOpenAI,
        statusMessage: "Active: High-speed native browser speech synthesis with dynamic rate/pitch behavior modulation.",
      },
      {
        provider: "elevenlabs",
        isConfigured: hasElevenLabs,
        isActive: hasElevenLabs,
        statusMessage: hasElevenLabs
          ? "Configured: ElevenLabs ultra-realistic neural speech stream."
          : "This integration requires configuration (set ELEVENLABS_API_KEY in environment or Settings).",
      },
      {
        provider: "openai_tts",
        isConfigured: hasOpenAI,
        isActive: false,
        statusMessage: hasOpenAI
          ? "Configured: OpenAI TTS-1 neural voice streaming."
          : "This integration requires configuration (set OPENAI_API_KEY in environment or Settings).",
      },
    ];
  }
}
