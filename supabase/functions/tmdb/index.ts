import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://lovable.dev',
  'https://machakos.pages.dev',
  'https://soudmovies.pages.dev',
  // Add your production domain here once deployed
];

const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.lovableproject.com')) return true;
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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const isAllowedOrigin = isOriginAllowed(origin);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin && origin ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate API Key Presence
    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    // 2. Parse Body
    const { endpoint, params } = await req.json();

    // 3. Security: Strict Endpoint Validation
    // Allows exact matches or paths starting with /movie/ or /tv/ (for details)
    const isEndpointAllowed = ALLOWED_ENDPOINTS.includes(endpoint) || 
                              /^\/movie\/\d+/.test(endpoint) || 
                              /^\/tv\/\d+/.test(endpoint);

    if (!isEndpointAllowed) {
      console.error(`Blocked unauthorized endpoint access: ${endpoint}`);
      throw new Error('Endpoint not allowed');
    }

    // 4. Construct URL
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // 5. Fetch from TMDB
    const response = await fetch(url.toString());
    const data = await response.json();

    // 6. Return Data
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('TMDB API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
