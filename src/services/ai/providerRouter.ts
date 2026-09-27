import {
  AIMessage,
  AIProvider,
  AIResponse,
  AgentToolDefinition,
  ModelRole,
  ProviderId,
} from './types';
import { OpenAIProvider } from '../providers/openaiProvider';
import { GeminiProvider } from '../providers/geminiProvider';
import { AnthropicProvider } from '../providers/anthropicProvider';
import { LocalFallbackProvider } from '../providers/localFallbackProvider';

export class ProviderRouter {
  private providers: Map<ProviderId, AIProvider> = new Map();
  private primaryProviderId: ProviderId;

  constructor() {
    // Instantiate all available providers
    const openai = new OpenAIProvider();
    const gemini = new GeminiProvider();
    const anthropic = new AnthropicProvider();
    const local = new LocalFallbackProvider();

    this.providers.set('openai', openai);
    this.providers.set('gemini', gemini);
    this.providers.set('anthropic', anthropic);
    this.providers.set('local', local);

    // Determine primary provider from environment or availability
    const envPrimary = (typeof process !== 'undefined' ? process.env?.PRIMARY_MODEL_PROVIDER : undefined)?.toLowerCase();
    if (envPrimary && this.providers.has(envPrimary as ProviderId) && this.providers.get(envPrimary as ProviderId)?.isAvailable()) {
      this.primaryProviderId = envPrimary as ProviderId;
    } else if (gemini.isAvailable()) {
      this.primaryProviderId = 'gemini';
    } else if (openai.isAvailable()) {
      this.primaryProviderId = 'openai';
    } else if (anthropic.isAvailable()) {
      this.primaryProviderId = 'anthropic';
    } else {
      this.primaryProviderId = 'local';
    }
  }

  public getPrimaryProvider(): AIProvider {
    return this.providers.get(this.primaryProviderId) || this.providers.get('local')!;
  }

  public getProvider(id: ProviderId): AIProvider | undefined {
    return this.providers.get(id);
  }

  public setPrimaryProvider(id: ProviderId): void {
    if (this.providers.has(id)) {
      this.primaryProviderId = id;
    }
  }

  /**
   * Resilient Generation with Automatic Fallback:
   * Try primary provider -> fallback to secondary -> fallback to local
   */
  public async generateWithFallback(
    messages: AIMessage[],
    options?: { role?: ModelRole; temperature?: number; maxTokens?: number }
  ): Promise<{ response: AIResponse; providersAttempted: ProviderId[]; usedFallback: boolean }> {
    const providersAttempted: ProviderId[] = [];
    const candidates: ProviderId[] = [
      this.primaryProviderId,
      this.primaryProviderId === 'gemini' ? 'openai' : 'gemini',
      'anthropic',
      'local',
    ].filter((id, index, self) => self.indexOf(id) === index) as ProviderId[];

    for (const providerId of candidates) {
      const provider = this.providers.get(providerId);
      if (!provider || !provider.isAvailable()) continue;

      providersAttempted.push(providerId);
      try {
        const response = await provider.generate(messages, options);
        return {
          response,
          providersAttempted,
          usedFallback: providerId !== this.primaryProviderId,
        };
      } catch (err) {
        console.warn(`[ProviderRouter] Provider ${providerId} failed, trying next fallback:`, err);
      }
    }

    // Final safety net: guaranteed local provider
    const local = this.providers.get('local')!;
    providersAttempted.push('local');
    const response = await local.generate(messages, options);
    return {
      response,
      providersAttempted,
      usedFallback: true,
    };
  }

  /**
   * Tool calling with fallback
   */
  public async toolCallWithFallback(
    messages: AIMessage[],
    tools: AgentToolDefinition[],
    options?: { role?: ModelRole; temperature?: number }
  ): Promise<{ response: AIResponse; providersAttempted: ProviderId[]; usedFallback: boolean }> {
    const providersAttempted: ProviderId[] = [];
    const candidates: ProviderId[] = [
      this.primaryProviderId,
      this.primaryProviderId === 'gemini' ? 'openai' : 'gemini',
      'anthropic',
      'local',
    ].filter((id, index, self) => self.indexOf(id) === index) as ProviderId[];

    for (const providerId of candidates) {
      const provider = this.providers.get(providerId);
      if (!provider || !provider.isAvailable()) continue;

      providersAttempted.push(providerId);
      try {
        if (provider.toolCall) {
          const response = await provider.toolCall(messages, tools, options);
          return {
            response,
            providersAttempted,
            usedFallback: providerId !== this.primaryProviderId,
          };
        }
      } catch (err) {
        console.warn(`[ProviderRouter] ToolCall on ${providerId} failed, trying next fallback:`, err);
      }
    }

    // Local fallback
    const local = this.providers.get('local')!;
    providersAttempted.push('local');
    const response = await local.generate(messages, options);
    return {
      response,
      providersAttempted,
      usedFallback: true,
    };
  }
}

export const providerRouter = new ProviderRouter();
