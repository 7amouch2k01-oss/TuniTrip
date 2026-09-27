-- ==============================================================================
-- TUNITRIP NOVA — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL + pgvector (place_embeddings) + Conversations + Messages
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. PLACES TABLE (Authoritative Grounded Knowledge)
CREATE TABLE IF NOT EXISTS public.places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    description TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    price_usd NUMERIC(10, 2) DEFAULT 0,
    price_tnd NUMERIC(10, 2) DEFAULT 0,
    price_unit TEXT DEFAULT 'per_person',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    image_url TEXT,
    opening_hours TEXT,
    family_friendly BOOLEAN DEFAULT true,
    calm_atmosphere BOOLEAN DEFAULT false,
    source_name TEXT NOT NULL DEFAULT 'Tunisian National Tourist Office (ONTT)',
    source_url TEXT NOT NULL DEFAULT 'https://www.discovertunisia.com',
    is_verified BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLACE EMBEDDINGS (pgvector 768-dim embeddings for Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS public.place_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.nova_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Tunisia Trip',
    destination TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_confirmation', 'confirmed', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.nova_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.nova_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT '[]'::jsonb,
    tool_results JSONB DEFAULT '[]'::jsonb,
    structured_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_places_city ON public.places(city);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_place_embeddings_place_id ON public.place_embeddings(place_id);
CREATE INDEX IF NOT EXISTS idx_nova_conversations_user_id ON public.nova_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_messages_conv_created ON public.nova_messages(conversation_id, created_at ASC);

-- HNSW Vector index for cosine distance
CREATE INDEX IF NOT EXISTS idx_place_embeddings_vector 
ON public.place_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 7. VECTOR SIMILARITY SEARCH STORED PROCEDURE: match_places()
CREATE OR REPLACE FUNCTION public.match_places(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10,
    filter_category TEXT DEFAULT NULL,
    filter_city TEXT DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    category TEXT,
    city TEXT,
    region TEXT,
    description TEXT,
    rating NUMERIC,
    review_count INT,
    price_usd NUMERIC,
    price_tnd NUMERIC,
    latitude NUMERIC,
    longitude NUMERIC,
    image_url TEXT,
    opening_hours TEXT,
    family_friendly BOOLEAN,
    calm_atmosphere BOOLEAN,
    source_name TEXT,
    source_url TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.category,
        p.city,
        p.region,
        p.description,
        p.rating,
        p.review_count,
        p.price_usd,
        p.price_tnd,
        p.latitude,
        p.longitude,
        p.image_url,
        p.opening_hours,
        p.family_friendly,
        p.calm_atmosphere,
        p.source_name,
        p.source_url,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM public.place_embeddings pe
    JOIN public.places p ON p.id = pe.place_id
    WHERE (filter_category IS NULL OR p.category = filter_category)
      AND (filter_city IS NULL OR p.city ILIKE '%' || filter_city || '%')
      AND (1 - (pe.embedding <=> query_embedding)) >= match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_messages ENABLE ROW LEVEL SECURITY;

-- Places & Embeddings: Public read-only for verified data
CREATE POLICY "Public places are viewable by all users" 
ON public.places FOR SELECT 
USING (is_verified = true);

CREATE POLICY "Public place embeddings are viewable by all users" 
ON public.place_embeddings FOR SELECT 
USING (true);

-- Conversations: Authenticated users manage only their own
CREATE POLICY "Users can view their own conversations" 
ON public.nova_conversations FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON public.nova_conversations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.nova_conversations FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.nova_conversations FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Messages: Authenticated users manage only messages in their conversations
CREATE POLICY "Users can view messages from their conversations" 
ON public.nova_messages FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages into their conversations" 
ON public.nova_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Anonymous restriction: anon role cannot read or write to private user conversations
-- (Anonymous conversations are ephemeral or handled via secure session in memory)
