// ==============================================================================
// TUNITRIP NOVA — NVIDIA LLM PROVIDER BOUNDARY (PREPARED)
// Prepared abstraction for future NVIDIA NIM / Brev GPU endpoints.
// NOTE: Exact transport is not guessed until Brev is provisioned.
// ==============================================================================

import {
  LLMProvider,
  LLMMessage,
  LLMToolDefinition,
  LLMResponse,
  LLMProviderOptions,
} from './types';
import { NovaError } from '../core/errors';

export interface NvidiaProviderConfig {
  endpoint?: string;
  apiKey?: string;
  modelName?: string;
}

export class NvidiaProvider implements LLMProvider {
  public readonly id = 'nvidia';
  public readonly name = 'NVIDIA NIM / Brev (Prepared Boundary)';

  private endpoint: string;
  private apiKey: string;
  private modelName: string;

  constructor(config: NvidiaProviderConfig = {}) {
    this.endpoint =
      config.endpoint ||
      (typeof process !== 'undefined' && process.env?.NVIDIA_API_ENDPOINT) ||
      '';
    this.apiKey =
      config.apiKey ||
      (typeof process !== 'undefined' && process.env?.NVIDIA_API_KEY) ||
      '';
    this.modelName =
      config.modelName ||
      (typeof process !== 'undefined' && process.env?.NVIDIA_MODEL_NAME) ||
      'meta/llama-3.1-70b-instruct';
  }

  public isConfigured(): boolean {
    return Boolean(this.endpoint && this.apiKey);
  }

  public async chat(
    _messages: LLMMessage[],
    _tools?: LLMToolDefinition[],
    _options?: LLMProviderOptions
  ): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw NovaError.providerUnavailable(
        'nvidia',
        'NVIDIA Brev endpoint is not yet configured. Set NVIDIA_API_ENDPOINT and NVIDIA_API_KEY once Brev instance is provisioned.'
      );
    }

    // Transport boundary: ready to connect to standard OpenAI-compatible NIM endpoint
    // once Brev container is spun up.
    try {
      const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: _messages,
          tools: _tools,
        }),
      });

      if (!response.ok) {
        throw NovaError.providerUnavailable('nvidia', `NVIDIA NIM responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content || '',
        toolCalls: data.choices?.[0]?.message?.tool_calls,
        finishReason: 'stop',
      };
    } catch (err: any) {
      if (err instanceof NovaError) throw err;
      throw NovaError.providerUnavailable('nvidia', `Failed to connect to NVIDIA NIM endpoint: ${err.message}`);
    }
  }

  public async generateEmbedding(_text: string): Promise<number[]> {
    if (!this.isConfigured()) {
      throw NovaError.providerUnavailable(
        'nvidia',
        'NVIDIA embedding endpoint is not configured.'
      );
    }
    throw NovaError.providerUnavailable('nvidia', 'NVIDIA embeddings awaiting Brev deployment.');
  }
}
