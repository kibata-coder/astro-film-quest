
-- 1) Lock down SECURITY DEFINER trigger function: only the trigger (table owner) needs to run it
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 2) Drop broad SELECT policy that allowed listing the avatars bucket.
--    Direct access via the public object URL still works for public buckets.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
