// ==============================================================================
// TUNITRIP NOVA — LLM PROVIDER ABSTRACTION INTERFACES
// Decouples NOVA Orchestrator from direct LLM vendor dependencies
// ==============================================================================

export type LLMRole = 'system' | 'user' | 'assistant' | 'tool';

export interface LLMToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface LLMToolResult {
  toolCallId: string;
  name: string;
  result: any;
}

export interface LLMMessage {
  role: LLMRole;
  content: string;
  name?: string;
  toolCalls?: LLMToolCall[];
  toolResults?: LLMToolResult[];
}

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface LLMToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  toolCalls?: LLMToolCall[];
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
  usage?: LLMUsage;
}

export interface LLMProviderOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Universal interface for LLM providers in NOVA.
 * Implemented by GeminiProvider today, NvidiaProvider tomorrow.
 */
export interface LLMProvider {
  readonly id: string;
  readonly name: string;
  
  /**
   * Performs chat completion with function/tool definitions.
   */
  chat(
    messages: LLMMessage[],
    tools?: LLMToolDefinition[],
    options?: LLMProviderOptions
  ): Promise<LLMResponse>;

  /**
   * Generates dense vector embedding for vector similarity matching.
   */
  generateEmbedding?(text: string): Promise<number[]>;
}
