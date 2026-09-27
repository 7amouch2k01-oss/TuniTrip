// ==============================================================================
// TUNITRIP NOVA — CONVERSATION & MEMORY TYPES
// ==============================================================================

import { LLMToolCall, LLMToolResult } from '../providers/types';

export interface NovaConversation {
  id: string;
  userId?: string;
  title: string;
  destination?: string;
  status: 'draft' | 'pending_confirmation' | 'confirmed' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface NovaMessageRecord {
  id: string;
  conversationId: string;
  userId?: string;
  sender: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: LLMToolCall[];
  toolResults?: LLMToolResult[];
  structuredData?: Record<string, any>;
  createdAt: string;
}

export interface ConversationContext {
  conversation: NovaConversation;
  messages: NovaMessageRecord[];
  isAnonymous: boolean;
}
