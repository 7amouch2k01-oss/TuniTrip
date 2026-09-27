// ==============================================================================
// TUNITRIP NOVA — LLM PROVIDER FACTORY
// Selects active LLM provider based on NOVA_LLM_PROVIDER configuration
// ==============================================================================

import { LLMProvider } from './types';
import { GeminiProvider } from './gemini';
import { NvidiaProvider } from './nvidia';
import { NovaError } from '../core/errors';

export type SupportedLLMProvider = 'gemini' | 'nvidia';

export interface ProviderFactoryOptions {
  providerName?: string;
  geminiApiKey?: string;
  nvidiaEndpoint?: string;
  nvidiaApiKey?: string;
}

export class LLMProviderFactory {
  /**
   * Resolves the configured LLM provider.
   * Priority:
   * 1. Explicit options.providerName
   * 2. process.env.NOVA_LLM_PROVIDER
   * 3. Default: 'gemini'
   */
  public static create(options: ProviderFactoryOptions = {}): LLMProvider {
    const envProvider =
      typeof process !== 'undefined'
        ? process.env?.NOVA_LLM_PROVIDER?.toLowerCase().trim()
        : undefined;

    const requested = (options.providerName || envProvider || 'gemini').toLowerCase();

    switch (requested) {
      case 'gemini':
        return new GeminiProvider({
          apiKey: options.geminiApiKey,
        });

      case 'nvidia':
        return new NvidiaProvider({
          endpoint: options.nvidiaEndpoint,
          apiKey: options.nvidiaApiKey,
        });

      default:
        throw NovaError.badRequest(
          `Unsupported LLM provider: '${requested}'. Supported providers are: 'gemini', 'nvidia'.`
        );
    }
  }
}
