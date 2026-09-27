import {
  Currency,
  ItineraryDay,
  NormalizedPlaceItem,
  PlaceCategory,
  PlaceItem,
  PlanMode,
  ProactiveInsight,
  StructuredTripProfile,
  ToolExecutionStep,
  TripProfile,
} from '../../types';

export type ModelRole =
  | 'FAST_CHAT'
  | 'PLANNER'
  | 'RESEARCHER'
  | 'REASONER'
  | 'CRITIC'
  | 'SYNTHESIZER';

export type ProviderId = 'openai' | 'gemini' | 'anthropic' | 'local';

export type SourceType =
  | 'official_gov'
  | 'unesco'
  | 'official_business'
  | 'google_places'
  | 'reputable_travel'
  | 'weather_service'
  | 'exchange_service'
  | 'curated_rag'
  | 'web_search';

export type PriceType = 'live' | 'estimated' | 'starting_from' | 'unavailable';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface AIResponse {
  content: string;
  role: 'assistant';
  provider: ProviderId;
  model: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIStreamChunk {
  contentChunk: string;
  isComplete: boolean;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolContext {
  requestId: string;
  profile?: TripProfile | StructuredTripProfile;
  currency?: Currency;
  onProgress?: (summary: string) => void;
}

export interface AgentToolResult {
  success: boolean;
  toolName: string;
  data: unknown;
  evidence?: EvidenceItem[];
  sources?: Array<{
    name: string;
    url: string;
    context: string;
    retrievedAt?: string;
  }>;
  error?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  definition: AgentToolDefinition;
  execute(input: Record<string, unknown>, context: ToolContext): Promise<AgentToolResult>;
}

export interface EvidenceItem {
  id: string;
  type: 'place' | 'hotel' | 'restaurant' | 'activity' | 'web' | 'weather' | 'fact' | 'rate' | 'route';
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  sourceType: SourceType;
  location?: string;
  coordinates?: { latitude: number; longitude: number };
  price?: number;
  currency?: string;
  priceType?: PriceType;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  isOpenNow?: boolean;
  availability?: string;
  image?: string;
  retrievedAt: string;
  publishedAt?: string;
  confidence: number;
  rawProvider?: string;
}

export interface SearchClassification {
  needs_web: boolean;
  needs_places: boolean;
  needs_maps: boolean;
  needs_weather: boolean;
  needs_exchange_rate: boolean;
  needs_rag: boolean;
  needs_external_llm: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  intent: 'greeting' | 'general_question' | 'weather' | 'place_search' | 'restaurant_search' | 'hotel_search' | 'trip_planning' | 'trip_modification' | 'booking_inquiry';
  targetQueries: string[];
  explanation: string;
}

export interface CorroborationResult {
  topic: string;
  isCorroborated: boolean;
  status: 'confirmed' | 'conflict' | 'single_source' | 'unverified';
  explanation: string;
  agreedValue?: unknown;
  conflictingSources?: string[];
  recommendedAdvice?: string;
}

export interface CritiqueResult {
  hasIssues: boolean;
  unsupportedClaims: string[];
  contradictions: string[];
  budgetOrRouteIssues: string[];
  suggestions: string[];
}

export interface OrchestratorLogEntry {
  requestId: string;
  timestamp: string;
  userMessage: string;
  intent: string;
  complexity: string;
  selectedTools: string[];
  providersUsed: string[];
  queries: string[];
  latencyMs: number;
  evidenceCount: number;
  errors: string[];
  fallbacks: string[];
  finalSources: string[];
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  isAvailable(): boolean;
  generate(messages: AIMessage[], options?: { role?: ModelRole; temperature?: number; maxTokens?: number }): Promise<AIResponse>;
  stream?(messages: AIMessage[], options?: { role?: ModelRole; temperature?: number }): AsyncIterable<AIStreamChunk>;
  toolCall?(messages: AIMessage[], tools: AgentToolDefinition[], options?: { role?: ModelRole; temperature?: number }): Promise<AIResponse>;
  structuredOutput?<T>(messages: AIMessage[], schema: Record<string, unknown>, options?: { role?: ModelRole; temperature?: number }): Promise<T>;
  supports(feature: 'web_search' | 'tool_call' | 'structured_output' | 'grounding'): boolean;
}
