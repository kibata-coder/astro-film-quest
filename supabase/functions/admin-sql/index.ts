// TEMPORARY admin SQL executor for one-time backup restore. DELETE IMMEDIATELY AFTER USE.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import postgres from 'npm:postgres@3.4.4'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!dbUrl) return new Response(JSON.stringify({ error: 'no db url' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const sql = postgres(dbUrl, { max: 1, prepare: false });
    try {
      const result = await sql.unsafe(body.sql);
      return new Response(JSON.stringify({ ok: true, rowCount: Array.isArray(result) ? result.length : null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } finally {
      await sql.end();
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
