-- Run this SQL in your Supabase project's SQL Editor
-- Replace 'YOUR_ADMIN_EMAIL_HERE' with your actual admin email address

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  email varchar,
  sign_up_date timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security Check: Verify if the currently authenticated user's email matches the admin email.
  -- This ensures users without the admin email cannot fetch this data.
  IF auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL_HERE' THEN
    RETURN QUERY SELECT u.id, u.email, u.created_at, u.last_sign_in_at FROM auth.users u;
  ELSE
    RAISE EXCEPTION 'Not authorized. You are not the admin.';
  END IF;
END;
$$;
