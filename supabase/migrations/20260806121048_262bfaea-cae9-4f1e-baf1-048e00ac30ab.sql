-- Event-trigger function: fires automatically on DDL, never called from the API.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;