import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://lovable.dev',
  'https://machakos.pages.dev',
  // Add your production domain here once deployed
];

// Check if origin is allowed (includes lovableproject.com pattern for previews)
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow all lovableproject.com subdomains for Lovable previews
  if (origin.endsWith('.lovableproject.com')) return true;
  return false;
};

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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP

// In-memory rate limit store (resets on cold starts, but provides basic protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically to prevent memory leaks
const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  // Try various headers that might contain the real client IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one (original client)
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
};

// Check rate limit for a given IP
const checkRateLimit = (clientIP: string): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  
  // Clean up old entries occasionally (every 100 requests)
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }
  
  if (!record || now > record.resetTime) {
    // First request or window expired - create new record
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  // Increment count
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
};

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

  // Check rate limit
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP);
  
  // Add rate limit headers
  const rateLimitHeaders = {
    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
  };
  
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(rateLimitResult.resetIn / 1000)
    }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        ...rateLimitHeaders,
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
      },
    });
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
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TMDB API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });
  }
});
