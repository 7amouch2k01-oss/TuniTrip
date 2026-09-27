// ==============================================================================
// TUNITRIP NOVA — NORMALIZED STREAMING EVENT ARCHITECTURE
// Events: thinking | tool_running | tool_done | answer | done | error
// ==============================================================================

import { NovaErrorCode } from './errors';

export type NovaEventType =
  | 'thinking'
  | 'tool_running'
  | 'tool_done'
  | 'answer'
  | 'done'
  | 'error';

export interface BaseEventPayload {
  timestamp: string;
}

export interface ThinkingPayload extends BaseEventPayload {
  stage: string;
  detail: string;
}

export interface ToolRunningPayload extends BaseEventPayload {
  toolName: string;
  toolCallId: string;
  args: Record<string, any>;
}

export interface ToolDonePayload extends BaseEventPayload {
  toolName: string;
  toolCallId: string;
  summary: string;
  resultCount?: number;
  result?: any;
}

export interface AnswerPayload extends BaseEventPayload {
  content: string;
  isFinalChunk?: boolean;
}

export interface DonePayload extends BaseEventPayload {
  conversationId: string;
  totalTokens?: number;
  toolsExecutedCount: number;
}

export interface ErrorPayload extends BaseEventPayload {
  code: NovaErrorCode;
  message: string;
}

export interface NovaEvent {
  type: NovaEventType;
  payload:
    | ThinkingPayload
    | ToolRunningPayload
    | ToolDonePayload
    | AnswerPayload
    | DonePayload
    | ErrorPayload;
}

export type NovaEventListener = (event: NovaEvent) => void;

export class NovaEventStream {
  private listeners: NovaEventListener[] = [];

  public subscribe(listener: NovaEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public emit(event: NovaEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in NovaEvent listener:', err);
      }
    }
  }

  public emitThinking(stage: string, detail: string): void {
    this.emit({
      type: 'thinking',
      payload: {
        stage,
        detail,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public emitToolRunning(toolName: string, toolCallId: string, args: Record<string, any>): void {
    this.emit({
      type: 'tool_running',
      payload: {
        toolName,
        toolCallId,
        args,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public emitToolDone(toolName: string, toolCallId: string, summary: string, resultCount?: number, result?: any): void {
    this.emit({
      type: 'tool_done',
      payload: {
        toolName,
        toolCallId,
        summary,
        resultCount,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public emitAnswer(content: string, isFinalChunk = true): void {
    this.emit({
      type: 'answer',
      payload: {
        content,
        isFinalChunk,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public emitDone(conversationId: string, toolsExecutedCount: number, totalTokens?: number): void {
    this.emit({
      type: 'done',
      payload: {
        conversationId,
        toolsExecutedCount,
        totalTokens,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public emitError(code: NovaErrorCode, message: string): void {
    this.emit({
      type: 'error',
      payload: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
