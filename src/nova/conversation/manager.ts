// ==============================================================================
// TUNITRIP NOVA — CONVERSATION & MEMORY MANAGER
// Bounded multi-turn context, persistence in Supabase, and anonymous isolation
// ==============================================================================

import {
  NovaConversation,
  NovaMessageRecord,
  ConversationContext,
} from './types';
import { LLMMessage, LLMToolCall, LLMToolResult } from '../providers/types';
import { NovaError } from '../core/errors';

export class ConversationManager {
  // In-memory isolated store for anonymous sessions & offline tests
  private static anonSessions: Map<string, { conversation: NovaConversation; messages: NovaMessageRecord[] }> = new Map();

  /**
   * Loads or creates a conversation with bounded recent history.
   * Enforces RLS semantics: authenticated users only access their own records.
   */
  public static async getOrCreateConversation(
    conversationId?: string,
    userId?: string,
    supabaseClient?: any,
    maxHistory = 10
  ): Promise<ConversationContext> {
    const isAnonymous = !userId;

    // 1. ANONYMOUS USER FLOW (Strict isolation: no protected DB access)
    if (isAnonymous) {
      const activeId = conversationId || `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let session = this.anonSessions.get(activeId);

      if (!session) {
        const newConv: NovaConversation = {
          id: activeId,
          title: 'Anonymous Tunisia Journey',
          destination: 'Tunisia',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        session = { conversation: newConv, messages: [] };
        this.anonSessions.set(activeId, session);
      }

      // Return bounded history
      const bounded = session.messages.slice(-maxHistory);
      return {
        conversation: session.conversation,
        messages: bounded,
        isAnonymous: true,
      };
    }

    // 2. AUTHENTICATED USER FLOW (Backed by Supabase nova_conversations & nova_messages)
    if (!supabaseClient) {
      // Local fallback for authenticated mock tests
      const activeId = conversationId || `user_${userId}_conv`;
      let session = this.anonSessions.get(activeId);
      if (!session) {
        session = {
          conversation: {
            id: activeId,
            userId,
            title: 'My Custom Tunisia Trip',
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          messages: [],
        };
        this.anonSessions.set(activeId, session);
      }
      return {
        conversation: session.conversation,
        messages: session.messages.slice(-maxHistory),
        isAnonymous: false,
      };
    }

    try {
      let conversation: NovaConversation;

      if (conversationId) {
        // Query conversation with RLS (auth.uid() = user_id)
        const { data, error } = await supabaseClient
          .from('nova_conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', userId)
          .single();

        if (error || !data) {
          throw NovaError.unauthorized('Conversation not found or access denied by RLS policy.');
        }

        conversation = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          destination: data.destination,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          metadata: data.metadata,
        };
      } else {
        // Create new conversation for authenticated user
        const { data, error } = await supabaseClient
          .from('nova_conversations')
          .insert({
            user_id: userId,
            title: 'New Tunisia Trip',
            status: 'draft',
          })
          .select()
          .single();

        if (error || !data) {
          throw NovaError.internal(`Failed to create conversation: ${error?.message}`);
        }

        conversation = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          destination: data.destination,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }

      // Fetch bounded recent history (e.g. last 10 messages)
      const { data: msgRows, error: msgError } = await supabaseClient
        .from('nova_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(maxHistory);

      if (msgError) {
        throw NovaError.internal(`Failed to load messages: ${msgError.message}`);
      }

      // Re-order ascending chronologically
      const messages: NovaMessageRecord[] = (msgRows || []).reverse().map((r: any) => ({
        id: r.id,
        conversationId: r.conversation_id,
        userId: r.user_id,
        sender: r.sender,
        content: r.content,
        toolCalls: r.tool_calls,
        toolResults: r.tool_results,
        structuredData: r.structured_data,
        createdAt: r.created_at,
      }));

      return {
        conversation,
        messages,
        isAnonymous: false,
      };
    } catch (err: any) {
      if (err instanceof NovaError) throw err;
      throw NovaError.internal(`Conversation management error: ${err.message}`);
    }
  }

  /**
   * Persists a user message.
   */
  public static async recordUserMessage(
    context: ConversationContext,
    content: string,
    supabaseClient?: any
  ): Promise<NovaMessageRecord> {
    const record: NovaMessageRecord = {
      id: `msg_${Date.now()}_u`,
      conversationId: context.conversation.id,
      userId: context.conversation.userId,
      sender: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    if (context.isAnonymous || !supabaseClient) {
      const session = this.anonSessions.get(context.conversation.id);
      if (session) {
        session.messages.push(record);
      }
      return record;
    }

    const { data, error } = await supabaseClient
      .from('nova_messages')
      .insert({
        conversation_id: context.conversation.id,
        user_id: context.conversation.userId,
        sender: 'user',
        content,
      })
      .select()
      .single();

    if (error) {
      console.warn('Failed to persist user message to Supabase:', error.message);
    }

    return data ? { ...record, id: data.id } : record;
  }

  /**
   * Persists an assistant response and any tool execution records.
   */
  public static async recordAssistantTurn(
    context: ConversationContext,
    content: string,
    toolCalls?: LLMToolCall[],
    toolResults?: LLMToolResult[],
    structuredData?: Record<string, any>,
    supabaseClient?: any
  ): Promise<NovaMessageRecord> {
    const record: NovaMessageRecord = {
      id: `msg_${Date.now()}_a`,
      conversationId: context.conversation.id,
      userId: context.conversation.userId,
      sender: 'assistant',
      content,
      toolCalls,
      toolResults,
      structuredData,
      createdAt: new Date().toISOString(),
    };

    if (context.isAnonymous || !supabaseClient) {
      const session = this.anonSessions.get(context.conversation.id);
      if (session) {
        session.messages.push(record);
      }
      return record;
    }

    const { data, error } = await supabaseClient
      .from('nova_messages')
      .insert({
        conversation_id: context.conversation.id,
        user_id: context.conversation.userId,
        sender: 'assistant',
        content,
        tool_calls: toolCalls || [],
        tool_results: toolResults || [],
        structured_data: structuredData || {},
      })
      .select()
      .single();

    if (error) {
      console.warn('Failed to persist assistant turn to Supabase:', error.message);
    }

    // Update conversation timestamp
    await supabaseClient
      .from('nova_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', context.conversation.id);

    return data ? { ...record, id: data.id } : record;
  }

  /**
   * Formats bounded message history into LLM input format.
   */
  public static formatForLLM(history: NovaMessageRecord[], maxMessages = 10): LLMMessage[] {
    const bounded = history.slice(-maxMessages);
    const llmMessages: LLMMessage[] = [];

    for (const msg of bounded) {
      llmMessages.push({
        role: msg.sender as any,
        content: msg.content,
        toolCalls: msg.toolCalls,
        toolResults: msg.toolResults,
      });
    }

    return llmMessages;
  }
}
