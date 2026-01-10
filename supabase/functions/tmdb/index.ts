import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://lovable.dev',
  'https://machakos.pages.dev/',
  // Add your production domain here once deployed
];

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Define strict allowlist of endpoints
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
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const { endpoint, params } = await req.json();

    // Validate the endpoint
    // Allows exact matches or paths starting with /movie/ or /tv/ (for details)
    const isEndpointAllowed = ALLOWED_ENDPOINTS.includes(endpoint) || 
                              /^\/movie\/\d+/.test(endpoint) || 
                              /^\/tv\/\d+/.test(endpoint);

    if (!isEndpointAllowed) {
      console.error(`Blocked unauthorized endpoint access: ${endpoint}`);
      throw new Error('Endpoint not allowed');
    }

    console.log('TMDB request:', endpoint, params);

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    const data = await response.json();

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
