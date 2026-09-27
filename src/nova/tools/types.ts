// ==============================================================================
// TUNITRIP NOVA — CENTRALIZED TOOL SYSTEM TYPES
// ==============================================================================

import { LLMToolDefinition } from '../providers/types';
import { Currency } from '../../types';

export interface NovaToolContext {
  conversationId?: string;
  userId?: string;
  currency?: Currency;
  supabaseClient?: any;
}

export interface ToolExecutionResult {
  success: boolean;
  summary: string;
  resultCount?: number;
  data?: any;
  error?: string;
}

export interface NovaTool {
  readonly name: string;
  readonly description: string;
  readonly definition: LLMToolDefinition;
  execute(args: Record<string, any>, context?: NovaToolContext): Promise<ToolExecutionResult>;
}
