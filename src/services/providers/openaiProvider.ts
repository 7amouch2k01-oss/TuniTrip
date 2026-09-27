import OpenAI from 'openai';
import {
  AIMessage,
  AIProvider,
  AIResponse,
  AIStreamChunk,
  AgentToolDefinition,
  ModelRole,
} from '../ai/types';
import { getSystemPrompt } from '../ai/prompts';

export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai' as const;
  public readonly name = 'OpenAI';
  private client: OpenAI | null = null;
  private fastModel: string;
  private reasoningModel: string;

  constructor() {
    const apiKey = typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined;
    this.fastModel = (typeof process !== 'undefined' ? process.env?.FAST_MODEL : undefined) || 'gpt-4o-mini';
    this.reasoningModel = (typeof process !== 'undefined' ? process.env?.REASONING_MODEL : undefined) || 'gpt-4o';

    if (apiKey) {
      try {
        this.client = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: false, // strictly enforce server-side execution
        });
      } catch {
        this.client = null;
      }
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.client);
  }

  public supports(feature: 'web_search' | 'tool_call' | 'structured_output' | 'grounding'): boolean {
    if (feature === 'tool_call' || feature === 'structured_output' || feature === 'web_search') {
      return true;
    }
    return false;
  }

  private selectModel(role?: ModelRole): string {
    if (role === 'REASONER' || role === 'CRITIC') {
      return this.reasoningModel;
    }
    return this.fastModel;
  }

  public async generate(
    messages: AIMessage[],
    options?: { role?: ModelRole; temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured (missing OPENAI_API_KEY).');
    }

    const model = this.selectModel(options?.role);
    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;

    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt && !messages.some((m) => m.role === 'system')) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      if (msg.role === 'system') {
        formattedMessages.push({ role: 'system', content: msg.content });
      } else if (msg.role === 'user') {
        formattedMessages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        formattedMessages.push({ role: 'assistant', content: msg.content });
      }
    }

    const completion = await this.client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 1500,
    });

    const choice = completion.choices[0];
    return {
      content: choice.message?.content || '',
      role: 'assistant',
      provider: 'openai',
      model,
      finishReason: choice.finish_reason || 'stop',
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  }

  public async *stream(
    messages: AIMessage[],
    options?: { role?: ModelRole; temperature?: number }
  ): AsyncIterable<AIStreamChunk> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured.');
    }

    const model = this.selectModel(options?.role);
    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt && !messages.some((m) => m.role === 'system')) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      formattedMessages.push({ role: msg.role as 'system' | 'user' | 'assistant', content: msg.content });
    }

    const stream = await this.client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.3,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      yield {
        contentChunk: delta,
        isComplete: chunk.choices[0]?.finish_reason !== null,
      };
    }
  }

  public async toolCall(
    messages: AIMessage[],
    tools: AgentToolDefinition[],
    options?: { role?: ModelRole; temperature?: number }
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured.');
    }

    const model = this.selectModel(options?.role);
    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt && !messages.some((m) => m.role === 'system')) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      formattedMessages.push({ role: msg.role as 'system' | 'user' | 'assistant', content: msg.content });
    }

    const formattedTools: OpenAI.Chat.ChatCompletionTool[] = tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const completion = await this.client.chat.completions.create({
      model,
      messages: formattedMessages,
      tools: formattedTools,
      tool_choice: 'auto',
      temperature: options?.temperature ?? 0.2,
    });

    const choice = completion.choices[0];
    const toolCalls = choice.message?.tool_calls?.map((tc) => {
      let parsedArgs: Record<string, unknown> = {};
      try {
        if ('function' in tc && tc.function.arguments) {
          parsedArgs = JSON.parse(tc.function.arguments);
        }
      } catch {
        parsedArgs = {};
      }
      return {
        id: tc.id,
        name: 'function' in tc ? tc.function.name : '',
        arguments: parsedArgs,
      };
    });

    return {
      content: choice.message?.content || '',
      role: 'assistant',
      provider: 'openai',
      model,
      toolCalls,
      finishReason: choice.finish_reason || 'stop',
    };
  }

  public async structuredOutput<T>(
    messages: AIMessage[],
    schema: Record<string, unknown>,
    options?: { role?: ModelRole; temperature?: number }
  ): Promise<T> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured.');
    }

    const model = this.selectModel(options?.role);
    const systemPrompt = options?.role ? getSystemPrompt(options.role) : undefined;
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt && !messages.some((m) => m.role === 'system')) {
      formattedMessages.push({
        role: 'system',
        content: `${systemPrompt}\nOutput strict valid JSON adhering to schema: ${JSON.stringify(schema)}`,
      });
    }

    for (const msg of messages) {
      formattedMessages.push({ role: msg.role as 'system' | 'user' | 'assistant', content: msg.content });
    }

    const completion = await this.client.chat.completions.create({
      model,
      messages: formattedMessages,
      response_format: { type: 'json_object' },
      temperature: options?.temperature ?? 0.1,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as T;
  }
}
