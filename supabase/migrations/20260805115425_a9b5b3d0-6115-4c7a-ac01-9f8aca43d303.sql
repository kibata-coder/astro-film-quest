-- Trigger-only function: must never be callable from the API.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Admin reporting helpers: they check the caller's email internally, but they
-- should not be reachable by signed-out visitors at all.
REVOKE ALL ON FUNCTION public.get_admin_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_admin_global_stats() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_global_stats() TO authenticated;