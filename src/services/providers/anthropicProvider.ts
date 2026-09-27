import {
  AIMessage,
  AIProvider,
  AIResponse,
  AgentToolDefinition,
  ModelRole,
} from '../ai/types';
import { getSystemPrompt } from '../ai/prompts';

export class AnthropicProvider implements AIProvider {
  public readonly id = 'anthropic' as const;
  public readonly name = 'Anthropic Claude';
  private apiKey: string | undefined;
  private model: string;

  constructor() {
    this.apiKey = typeof process !== 'undefined' ? process.env?.ANTHROPIC_API_KEY : undefined;
    this.model = (typeof process !== 'undefined' ? process.env?.ANTHROPIC_MODEL : undefined) || 'claude-3-5-sonnet-20241022';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public supports(feature: 'web_search' | 'tool_call' | 'structured_output' | 'grounding'): boolean {
    if (feature === 'tool_call' || feature === 'structured_output') {
      return true;
    }
    return false;
  }

  public async generate(
    messages: AIMessage[],
    options?: { role?: ModelRole; temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic client is not configured (missing ANTHROPIC_API_KEY).');
    }

    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const formattedMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: formattedMessages,
        max_tokens: options?.maxTokens ?? 1500,
        temperature: options?.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    return {
      content,
      role: 'assistant',
      provider: 'anthropic',
      model: this.model,
      finishReason: data.stop_reason || 'end_turn',
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  }

  public async toolCall(
    messages: AIMessage[],
    tools: AgentToolDefinition[],
    options?: { role?: ModelRole; temperature?: number }
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic client is not configured.');
    }

    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const formattedMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const anthropicTools = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: formattedMessages,
        tools: anthropicTools,
        max_tokens: 1500,
        temperature: options?.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic tool error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];
    let textContent = '';

    for (const block of data.content || []) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input || {},
        });
      }
    }

    return {
      content: textContent,
      role: 'assistant',
      provider: 'anthropic',
      model: this.model,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: data.stop_reason || 'tool_use',
    };
  }

  public async structuredOutput<T>(
    messages: AIMessage[],
    schema: Record<string, unknown>,
    options?: { role?: ModelRole; temperature?: number }
  ): Promise<T> {
    const jsonPrompt: AIMessage[] = [
      ...messages,
      {
        role: 'user',
        content: `Please provide the output strictly formatted as valid JSON adhering to schema: ${JSON.stringify(schema)}. Do not output markdown code fences or conversational text.`,
      },
    ];

    const res = await this.generate(jsonPrompt, { role: options?.role, temperature: 0.1 });
    const cleaned = res.content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
