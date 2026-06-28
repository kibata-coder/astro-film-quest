import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';
// Public app API key for OpenSubtitles (free tier, no account needed for search)
const OS_API_KEY = Deno.env.get('OPENSUBTITLES_API_KEY') || 'sG1Aq1gNe8GfSRYEnzxfXM5lE4jz5dkm';

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

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // ─── ACTION: search ───────────────────────────────────────────────────────
    // Returns a list of available subtitle files for a given TMDB ID
    // GET ?action=search&tmdb_id=385687&type=movie&language=en
    if (action === 'search') {
      const tmdbId = url.searchParams.get('tmdb_id');
      const type = url.searchParams.get('type') || 'movie'; // movie | episode
      const language = url.searchParams.get('language') || 'en';
      const season = url.searchParams.get('season');
      const episode = url.searchParams.get('episode');

      if (!tmdbId) {
        return new Response(JSON.stringify({ error: 'tmdb_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const searchParams = new URLSearchParams({
        tmdb_id: tmdbId,
        type,
        languages: language,
        order_by: 'download_count',
        order_direction: 'desc',
      });

      if (type === 'episode' && season && episode) {
        searchParams.set('season_number', season);
        searchParams.set('episode_number', episode);
      }

      const searchRes = await fetch(
        `${OPENSUBTITLES_API}/subtitles?${searchParams}`,
        {
          headers: {
            'Api-Key': OS_API_KEY,
            'Content-Type': 'application/json',
            'User-Agent': 'SoudFlex v1.0',
          },
        }
      );

      if (!searchRes.ok) {
        const err = await searchRes.text();
        console.error('OpenSubtitles search error:', err);
        return new Response(JSON.stringify({ error: 'Subtitle search failed', details: err }), {
          status: searchRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await searchRes.json();

      // Return simplified list so the client doesn't need to parse the full OS response
      const results = (data.data || []).map((item: any) => {
        const attrs = item.attributes || {};
        const file = (attrs.files || [])[0] || {};
        return {
          id: item.id,
          file_id: file.file_id,
          file_name: file.file_name || attrs.release || 'Unknown',
          language: attrs.language,
          hi: attrs.hearing_impaired,
          download_count: attrs.download_count,
          release: attrs.release,
          uploader: attrs.uploader?.name || '',
        };
      }).filter((s: any) => s.file_id);

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── ACTION: download ─────────────────────────────────────────────────────
    // Returns the direct SRT download URL for a given file_id
    // GET ?action=download&file_id=12345
    if (action === 'download') {
      const fileId = url.searchParams.get('file_id');
      if (!fileId) {
        return new Response(JSON.stringify({ error: 'file_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const dlRes = await fetch(`${OPENSUBTITLES_API}/download`, {
        method: 'POST',
        headers: {
          'Api-Key': OS_API_KEY,
          'Content-Type': 'application/json',
          'User-Agent': 'SoudFlex v1.0',
        },
        body: JSON.stringify({ file_id: Number(fileId) }),
      });

      if (!dlRes.ok) {
        const err = await dlRes.text();
        console.error('OpenSubtitles download link error:', err);
        return new Response(JSON.stringify({ error: 'Failed to get download link', details: err }), {
          status: dlRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const dlData = await dlRes.json();
      return new Response(JSON.stringify({ link: dlData.link }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── ACTION: proxy ────────────────────────────────────────────────────────
    // Proxies the actual SRT file content with CORS headers so vidsrc can load it
    // GET ?action=proxy&url=<encoded-srt-url>
    if (action === 'proxy') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'url required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Basic validation — only allow opensubtitles download CDN URLs
      const decoded = decodeURIComponent(targetUrl);
      if (!decoded.includes('opensubtitles') && !decoded.includes('os-cdn')) {
        return new Response(JSON.stringify({ error: 'Invalid proxy target' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const srtRes = await fetch(decoded);
      if (!srtRes.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch subtitle file' }), {
          status: srtRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const srtContent = await srtRes.text();

      return new Response(srtContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/srt; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          // Vidsrc needs these to load the subtitle file cross-origin
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: search, download, or proxy' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Subtitles function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
