import {
  AIMessage,
  AIProvider,
  AIResponse,
  AgentToolDefinition,
  ModelRole,
} from '../ai/types';
import { getSystemPrompt } from '../ai/prompts';

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini' as const;
  public readonly name = 'Google Gemini';
  private apiKey: string | undefined;
  private model: string;

  constructor() {
    this.apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    this.model = (typeof process !== 'undefined' ? process.env?.GEMINI_MODEL : undefined) || 'gemini-1.5-flash';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public supports(feature: 'web_search' | 'tool_call' | 'structured_output' | 'grounding'): boolean {
    if (feature === 'grounding' || feature === 'web_search' || feature === 'tool_call' || feature === 'structured_output') {
      return true;
    }
    return false;
  }

  public async generate(
    messages: AIMessage[],
    options?: { role?: ModelRole; temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini client is not configured (missing GEMINI_API_KEY).');
    }

    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        maxOutputTokens: options?.maxTokens ?? 1500,
      },
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.find((p: { text?: string }) => p.text)?.text || '';

    return {
      content: textPart,
      role: 'assistant',
      provider: 'gemini',
      model: this.model,
      finishReason: candidate?.finishReason || 'STOP',
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
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
      throw new Error('Gemini client is not configured.');
    }

    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const functionDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload: Record<string, unknown> = {
      contents,
      tools: [{ functionDeclarations }],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
      },
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini toolCall error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];
    let textContent = '';

    for (const part of parts) {
      if (part.text) {
        textContent += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args || {},
        });
      }
    }

    return {
      content: textContent,
      role: 'assistant',
      provider: 'gemini',
      model: this.model,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: candidate?.finishReason || 'STOP',
    };
  }

  public async structuredOutput<T>(
    messages: AIMessage[],
    schema: Record<string, unknown>,
    options?: { role?: ModelRole; temperature?: number }
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Gemini client is not configured.');
    }

    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: options?.temperature ?? 0.1,
      },
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini structured output error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.find((p: { text?: string }) => p.text)?.text || '{}';
    return JSON.parse(textPart) as T;
  }
}
