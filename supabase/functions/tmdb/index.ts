import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Allowed endpoint prefixes for validation
const ALLOWED_ENDPOINTS = [
  '/trending/',
  '/search/',
  '/movie/',
  '/discover/',
  '/tv/',
];

// Validate endpoint parameter
function isValidEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string') return false;
  if (endpoint.length > 200) return false;
  
  // Must start with an allowed prefix
  return ALLOWED_ENDPOINTS.some(prefix => endpoint.startsWith(prefix));
}

// Validate params object
function validateParams(params: unknown): { valid: boolean; error?: string } {
  if (params === undefined || params === null) {
    return { valid: true };
  }
  
  if (typeof params !== 'object' || Array.isArray(params)) {
    return { valid: false, error: 'Invalid params format' };
  }
  
  const p = params as Record<string, unknown>;
  
  // Validate page parameter
  if (p.page !== undefined) {
    const page = Number(p.page);
    if (isNaN(page) || page < 1 || page > 1000) {
      return { valid: false, error: 'Invalid page parameter' };
    }
  }
  
  // Validate query parameter
  if (p.query !== undefined) {
    if (typeof p.query !== 'string' || p.query.length > 500) {
      return { valid: false, error: 'Invalid query parameter' };
    }
  }
  
  // Validate language parameters
  if (p.with_original_language !== undefined) {
    if (typeof p.with_original_language !== 'string' || p.with_original_language.length > 100) {
      return { valid: false, error: 'Invalid language parameter' };
    }
  }
  
  if (p.without_original_language !== undefined) {
    if (typeof p.without_original_language !== 'string' || p.without_original_language.length > 100) {
      return { valid: false, error: 'Invalid language parameter' };
    }
  }
  
  // Validate sort_by parameter
  if (p.sort_by !== undefined) {
    const validSortOptions = ['popularity.desc', 'popularity.asc', 'release_date.desc', 'release_date.asc', 'vote_average.desc', 'vote_average.asc'];
    if (typeof p.sort_by !== 'string' || !validSortOptions.includes(p.sort_by)) {
      return { valid: false, error: 'Invalid sort_by parameter' };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      console.error('TMDB_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { endpoint, params } = body;
    
    // Validate endpoint
    if (!isValidEndpoint(endpoint)) {
      console.warn('Invalid endpoint requested:', endpoint);
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate params
    const paramsValidation = validateParams(params);
    if (!paramsValidation.valid) {
      console.warn('Invalid params:', paramsValidation.error);
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('TMDB request:', endpoint);

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

    console.log('TMDB response status:', response.status);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TMDB API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch movie data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
