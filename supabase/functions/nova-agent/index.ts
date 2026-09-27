// ==============================================================================
// TUNITRIP NOVA — SUPABASE EDGE FUNCTION: nova-agent
// Thin serverless entrypoint delegating to NOVA Orchestrator
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { NovaOrchestrator } from '../../../src/nova/core/orchestrator.ts';
import { NovaError } from '../../../src/nova/core/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Parse Payload
    const body = await req.json();
    const { message, conversationId, currency, stream = true } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify(NovaError.badRequest('Message parameter is required.').toJSON()),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Authenticate User Context from Bearer Token
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    let userId: string | undefined = undefined;
    let userRole: 'authenticated' | 'anon' = 'anon';
    let userSupabaseClient: any = undefined;

    if (token && supabaseUrl && supabaseAnonKey) {
      // Create user-scoped client obeying RLS
      userSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const { data: { user } } = await userSupabaseClient.auth.getUser();
      if (user) {
        userId = user.id;
        userRole = 'authenticated';
      }
    }

    // 4. Initialize Orchestrator
    const orchestrator = new NovaOrchestrator();

    // 5. Server-Sent Events (SSE) Streaming or Direct JSON
    if (stream) {
      const responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      // Background execution streaming events to client
      (async () => {
        try {
          await orchestrator.process(
            {
              message,
              conversationId,
              userId,
              userRole,
              currency,
              supabaseClient: userSupabaseClient,
            },
            (event) => {
              const sseFormatted = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
              writer.write(encoder.encode(sseFormatted)).catch(() => {});
            }
          );
        } catch (err: any) {
          const novaErr = err instanceof NovaError ? err : NovaError.internal(err.message);
          const errorSse = `event: error\ndata: ${JSON.stringify(novaErr.toJSON().error)}\n\n`;
          writer.write(encoder.encode(errorSse)).catch(() => {});
        } finally {
          writer.close().catch(() => {});
        }
      })();

      return new Response(responseStream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Direct JSON Response
    const result = await orchestrator.process({
      message,
      conversationId,
      userId,
      userRole,
      currency,
      supabaseClient: userSupabaseClient,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const novaErr = err instanceof NovaError ? err : NovaError.internal(err.message);
    return new Response(JSON.stringify(novaErr.toJSON()), {
      status: novaErr.status || 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
