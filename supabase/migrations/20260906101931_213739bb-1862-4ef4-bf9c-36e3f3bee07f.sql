CREATE OR REPLACE FUNCTION public.get_admin_user_detail(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  email character varying,
  display_name text,
  avatar_url text,
  sign_up_date timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  watch_count bigint,
  rating_count bigint,
  bookmark_count bigint,
  collection_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.jwt() ->> 'email' <> 'kibata988@gmail.com' THEN
    RAISE EXCEPTION 'Not authorized. You are not the admin.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    p.display_name,
    p.avatar_url,
    u.created_at,
    u.last_sign_in_at,
    (SELECT COUNT(*) FROM public.watch_history w WHERE w.user_id = u.id),
    (SELECT COUNT(*) FROM public.ratings r WHERE r.user_id = u.id),
    (SELECT COUNT(*) FROM public.bookmarks b WHERE b.user_id = u.id),
    (SELECT COUNT(*) FROM public.collections c WHERE c.user_id = u.id)
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_user_activity(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.jwt() ->> 'email' <> 'kibata988@gmail.com' THEN
    RAISE EXCEPTION 'Not authorized. You are not the admin.';
  END IF;

  SELECT jsonb_build_object(
    'watch_history', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT w.media_id, w.media_type, w.title, w.poster_path, w.season_number,
               w.episode_number, w.progress, w.duration, w.is_anime, w.updated_at
        FROM public.watch_history w
        WHERE w.user_id = target_user_id
        ORDER BY w.updated_at DESC
        LIMIT 200
      ) t
    ), '[]'::jsonb),
    'ratings', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT r.media_id, r.media_type, r.rating, r.updated_at
        FROM public.ratings r
        WHERE r.user_id = target_user_id
        ORDER BY r.updated_at DESC
        LIMIT 200
      ) t
    ), '[]'::jsonb),
    'bookmarks', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT b.media_id, b.media_type, b.title, b.poster_path, b.created_at
        FROM public.bookmarks b
        WHERE b.user_id = target_user_id
        ORDER BY b.created_at DESC
        LIMIT 200
      ) t
    ), '[]'::jsonb),
    'collections', COALESCE((
      SELECT jsonb_agg(t) FROM (
        SELECT c.id, c.name, c.created_at,
               (SELECT COUNT(*) FROM public.collection_items ci WHERE ci.collection_id = c.id) AS item_count
        FROM public.collections c
        WHERE c.user_id = target_user_id
        ORDER BY c.created_at DESC
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_user_detail(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_activity(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_user_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_user_activity(uuid) TO authenticated;