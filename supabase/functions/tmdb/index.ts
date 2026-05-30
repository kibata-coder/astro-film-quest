import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://lovable.dev',
  'https://machakos.pages.dev',
  'https://soudmovies.pages.dev',
  'https://soudflex.pages.dev',
];

const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.lovableproject.com')) return true;
  if (origin.endsWith('.lovable.app')) return true;
  return false;
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const ALLOWED_ENDPOINTS = [
  '/trending/movie/week',
  '/trending/tv/week',
  '/search/movie',
  '/search/tv',
  '/discover/movie',
  '/discover/tv',
];

const ALLOWED_ENDPOINT_PATTERNS = [
  /^\/movie\/\d+$/,
  /^\/movie\/\d+\/credits$/,
  /^\/movie\/\d+\/videos$/,
  /^\/movie\/\d+\/watch\/providers$/,
  /^\/movie\/\d+\/similar$/,
  /^\/movie\/\d+\/recommendations$/,
  /^\/tv\/\d+$/,
  /^\/tv\/\d+\/credits$/,
  /^\/tv\/\d+\/videos$/,
  /^\/tv\/\d+\/similar$/,
  /^\/tv\/\d+\/recommendations$/,
  /^\/tv\/\d+\/season\/\d+$/,
  /^\/tv\/\d+\/season\/\d+\/episode\/\d+$/,
  /^\/collection\/\d+$/,
];

// In-memory cache per isolate. Survives between requests on warm invocations.
interface CacheEntry { data: unknown; expiresAt: number }
const memCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 500;

// Pick TTL (seconds) for an endpoint
const ttlFor = (endpoint: string): number => {
  if (endpoint.startsWith('/search/')) return 300;               // 5 min
  if (endpoint.startsWith('/trending/')) return 1800;            // 30 min
  if (endpoint.startsWith('/discover/')) return 3600;            // 1 h
  // movie/tv/season/episode/collection details, credits, videos, providers, similar
  return 86400;                                                  // 24 h
};

const cacheGet = (key: string): unknown | null => {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.data;
};

const cacheSet = (key: string, data: unknown, ttlSec: number) => {
  if (memCache.size >= MAX_CACHE_ENTRIES) {
    // crude eviction: drop oldest by insertion order
    const firstKey = memCache.keys().next().value;
    if (firstKey) memCache.delete(firstKey);
  }
  memCache.set(key, { data, expiresAt: Date.now() + ttlSec * 1000 });
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const isAllowedOrigin = isOriginAllowed(origin);

  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin && origin ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) throw new Error('TMDB_API_KEY not configured');

    // Accept both POST (legacy invoke) and GET (cacheable)
    let endpoint: string;
    let params: Record<string, unknown> | undefined;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      endpoint = url.searchParams.get('endpoint') || '';
      const paramsStr = url.searchParams.get('params');
      params = paramsStr ? JSON.parse(paramsStr) : undefined;
    } else {
      const body = await req.json();
      endpoint = body.endpoint;
      params = body.params;
    }

    const isEndpointAllowed =
      ALLOWED_ENDPOINTS.includes(endpoint) ||
      ALLOWED_ENDPOINT_PATTERNS.some((p) => p.test(endpoint));

    if (!isEndpointAllowed) {
      console.error(`Blocked unauthorized endpoint: ${endpoint}`);
      throw new Error('Endpoint not allowed');
    }

    // Build stable cache key
    const sortedParams = params
      ? Object.keys(params).sort().map((k) => `${k}=${params![k]}`).join('&')
      : '';
    const cacheKey = `${endpoint}?${sortedParams}`;
    const ttl = ttlFor(endpoint);

    // Try cache
    const cached = cacheGet(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${ttl}`,
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch from TMDB
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
      });
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (response.ok) cacheSet(cacheKey, data, ttl);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${ttl}`,
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('TMDB API error:', error);

    let clientMessage = 'Failed to fetch movie data';
    if (error instanceof Error) {
      if (error.message.includes('not configured')) clientMessage = 'Service temporarily unavailable';
      else if (error.message.includes('not allowed')) clientMessage = 'Invalid request';
    }

    return new Response(JSON.stringify({ error: clientMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
