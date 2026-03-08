

## Plan: Sanitize TMDB Edge Function Error Messages

Replace raw error messages with safe client-facing messages in the catch block of `supabase/functions/tmdb/index.ts` (lines ~86-92).

### Change

Map internal error strings to generic messages:
- "not configured" → "Service temporarily unavailable"
- "not allowed" → "Invalid request"
- All others → "Failed to fetch movie data"

Internal details remain in `console.error` for server-side debugging.

