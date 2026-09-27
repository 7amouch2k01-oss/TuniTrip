// ==============================================================================
// TUNITRIP NOVA — FRONTEND CLIENT CONNECTOR
// Connects UI to Supabase Edge Function nova-agent with local orchestrator fallback
// ==============================================================================

import { NovaEvent } from '../nova/core/events';
import { NovaOrchestrator } from '../nova/core/orchestrator';
import { Currency } from '../types';

export interface SendMessageOptions {
  conversationId?: string;
  currency?: Currency;
  authToken?: string;
  onEvent?: (event: NovaEvent) => void;
}

export interface NovaClientResponse {
  conversationId: string;
  response: string;
  toolStepsExecuted: number;
}

export class NovaClient {
  private static instance: NovaClient;
  private localOrchestrator: NovaOrchestrator;
  private edgeFunctionUrl?: string;

  private constructor() {
    this.localOrchestrator = new NovaOrchestrator();

    const supabaseUrl =
      typeof import.meta !== 'undefined'
        ? (import.meta as any).env?.VITE_SUPABASE_URL
        : undefined;

    if (supabaseUrl) {
      this.edgeFunctionUrl = `${supabaseUrl}/functions/v1/nova-agent`;
    }
  }

  public static getInstance(): NovaClient {
    if (!NovaClient.instance) {
      NovaClient.instance = new NovaClient();
    }
    return NovaClient.instance;
  }

  /**
   * Sends a user message to NOVA and streams normalized events.
   */
  public async sendMessage(
    message: string,
    options: SendMessageOptions = {}
  ): Promise<NovaClientResponse> {
    const { conversationId, currency = 'USD', authToken, onEvent } = options;

    // 1. If Edge Function URL is configured, use real remote endpoint
    if (this.edgeFunctionUrl) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = await fetch(this.edgeFunctionUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message,
            conversationId,
            currency,
            stream: Boolean(onEvent),
          }),
        });

        if (res.ok && onEvent && res.body) {
          return await this.consumeSSEStream(res.body, onEvent);
        }

        if (res.ok) {
          const json = await res.json();
          return {
            conversationId: json.conversationId,
            response: json.response,
            toolStepsExecuted: json.toolStepsExecuted,
          };
        }
      } catch (err) {
        console.warn('Edge function connection failed, falling back to local orchestrator:', err);
      }
    }

    // 2. Local high-speed Orchestrator (used for local testing, offline dev & seamless demo)
    const result = await this.localOrchestrator.process(
      {
        message,
        conversationId,
        currency,
      },
      onEvent
    );

    return {
      conversationId: result.conversationId,
      response: result.response,
      toolStepsExecuted: result.toolStepsExecuted,
    };
  }

  private async consumeSSEStream(
    body: ReadableStream<Uint8Array>,
    onEvent: (event: NovaEvent) => void
  ): Promise<NovaClientResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalAnswer = '';
    let convId = '';
    let toolsCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const eventMatch = line.match(/^event:\s*(\w+)/m);
        const dataMatch = line.match(/^data:\s*(.*)$/m);

        if (eventMatch && dataMatch) {
          const type = eventMatch[1] as NovaEvent['type'];
          try {
            const payload = JSON.parse(dataMatch[1]);
            const event: NovaEvent = { type, payload };
            onEvent(event);

            if (type === 'answer' && payload.content) {
              finalAnswer = payload.content;
            } else if (type === 'done') {
              convId = payload.conversationId;
              toolsCount = payload.toolsExecutedCount || 0;
            }
          } catch {
            // Skip unparseable chunks
          }
        }
      }
    }

    return {
      conversationId: convId,
      response: finalAnswer,
      toolStepsExecuted: toolsCount,
    };
  }
}

export const novaClient = NovaClient.getInstance();
