export interface LLMProviderStatus {
  provider: "builtin_interview_brain" | "openai" | "anthropic" | "gemini";
  isConfigured: boolean;
  isActive: boolean;
  statusMessage: string;
}

export class LLMProviderService {
  public static getAvailableProviders(): LLMProviderStatus[] {
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);

    return [
      {
        provider: "builtin_interview_brain",
        isConfigured: true,
        isActive: !hasOpenAI && !hasAnthropic && !hasGemini,
        statusMessage: "Active: Veyra Autonomous Interview Brain with structured reasoning, claim cross-referencing, and adaptive follow-up engine.",
      },
      {
        provider: "openai",
        isConfigured: hasOpenAI,
        isActive: hasOpenAI,
        statusMessage: hasOpenAI
          ? "Configured: OpenAI GPT-4o / Realtime API."
          : "This integration requires configuration (set OPENAI_API_KEY in environment or Settings).",
      },
      {
        provider: "anthropic",
        isConfigured: hasAnthropic,
        isActive: false,
        statusMessage: hasAnthropic
          ? "Configured: Anthropic Claude 3.5 Sonnet."
          : "This integration requires configuration (set ANTHROPIC_API_KEY in environment or Settings).",
      },
      {
        provider: "gemini",
        isConfigured: hasGemini,
        isActive: false,
        statusMessage: hasGemini
          ? "Configured: Google Gemini 1.5/2.0 Pro."
          : "This integration requires configuration (set GEMINI_API_KEY in environment or Settings).",
      },
    ];
  }
}
