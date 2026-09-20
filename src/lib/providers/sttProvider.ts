export interface STTProviderStatus {
  provider: "web_speech_recognition" | "whisper_api" | "deepgram";
  isConfigured: boolean;
  isActive: boolean;
  statusMessage: string;
}

export class STTProviderService {
  public static getAvailableProviders(): STTProviderStatus[] {
    const hasWhisper = Boolean(process.env.OPENAI_API_KEY);
    const hasDeepgram = Boolean(process.env.DEEPGRAM_API_KEY);

    return [
      {
        provider: "web_speech_recognition",
        isConfigured: true,
        isActive: !hasWhisper && !hasDeepgram,
        statusMessage: "Active: Real-time browser speech recognition with partial transcript streaming & VAD.",
      },
      {
        provider: "whisper_api",
        isConfigured: hasWhisper,
        isActive: hasWhisper,
        statusMessage: hasWhisper
          ? "Configured: OpenAI Whisper speech-to-text API."
          : "This integration requires configuration (set OPENAI_API_KEY in environment or Settings).",
      },
      {
        provider: "deepgram",
        isConfigured: hasDeepgram,
        isActive: false,
        statusMessage: hasDeepgram
          ? "Configured: Deepgram Nova-2 ultra-low latency streaming STT."
          : "This integration requires configuration (set DEEPGRAM_API_KEY in environment or Settings).",
      },
    ];
  }
}
