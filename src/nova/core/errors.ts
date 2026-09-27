// ==============================================================================
// TUNITRIP NOVA — NORMALIZED ERROR MODEL
// ==============================================================================

export type NovaErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'provider_unavailable'
  | 'retrieval_error'
  | 'tool_error'
  | 'internal_error';

export interface SerializedNovaError {
  error: {
    code: NovaErrorCode;
    message: string;
    status: number;
    details?: any;
    timestamp: string;
  };
}

export class NovaError extends Error {
  public readonly code: NovaErrorCode;
  public readonly status: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(code: NovaErrorCode, message: string, status = 400, details?: any) {
    super(message);
    this.name = 'NovaError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, NovaError.prototype);
  }

  /**
   * Safe serialization for user/client response.
   * Strips internal stack traces, private credentials, and raw provider errors.
   */
  public toJSON(): SerializedNovaError {
    return {
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }

  public static badRequest(message: string, details?: any): NovaError {
    return new NovaError('bad_request', message, 400, details);
  }

  public static unauthorized(message = 'Authentication required or invalid session.'): NovaError {
    return new NovaError('unauthorized', message, 401);
  }

  public static rateLimited(message = 'Too many requests. Please wait before submitting again.'): NovaError {
    return new NovaError('rate_limited', message, 429);
  }

  public static quotaExceeded(message = 'Service quota currently reached. Please try again shortly.'): NovaError {
    return new NovaError('quota_exceeded', message, 429);
  }

  public static providerUnavailable(providerName: string, reason?: string): NovaError {
    const msg = reason || `The requested LLM provider (${providerName}) is currently not available.`;
    return new NovaError('provider_unavailable', msg, 503);
  }

  public static retrievalError(message = 'Failed to retrieve grounded records from knowledgebase.'): NovaError {
    return new NovaError('retrieval_error', message, 500);
  }

  public static toolError(toolName: string, message: string, details?: any): NovaError {
    return new NovaError('tool_error', `Tool execution failed for '${toolName}': ${message}`, 500, details);
  }

  public static internal(message = 'An unexpected internal error occurred in NOVA.'): NovaError {
    return new NovaError('internal_error', message, 500);
  }
}
