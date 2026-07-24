-- Run this SQL in your Supabase project's SQL Editor
-- Replace 'YOUR_ADMIN_EMAIL_HERE' with your actual admin email address
-- This creates a function to get global analytics for the admin dashboard

CREATE OR REPLACE FUNCTION public.get_admin_global_stats()
RETURNS TABLE (
  total_watch_history bigint,
  total_ratings bigint,
  total_bookmarks bigint,
  total_collections bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security Check: Verify if the currently authenticated user's email matches the admin email.
  IF auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL_HERE' THEN
    RETURN QUERY 
    SELECT 
      (SELECT COUNT(*) FROM public.watch_history) as total_watch_history,
      (SELECT COUNT(*) FROM public.ratings) as total_ratings,
      (SELECT COUNT(*) FROM public.bookmarks) as total_bookmarks,
      (SELECT COUNT(*) FROM public.collections) as total_collections;
  ELSE
    RAISE EXCEPTION 'Not authorized. You are not the admin.';
  END IF;
END;
$$;
