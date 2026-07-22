CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    media_id integer NOT NULL,
    media_type text NOT NULL,
    title text NOT NULL,
    poster_path text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT bookmarks_media_type_check CHECK ((media_type = ANY (ARRAY['movie'::text, 'tv'::text])))
);

CREATE TABLE IF NOT EXISTS public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id uuid NOT NULL,
    user_id uuid NOT NULL,
    media_id integer NOT NULL,
    media_type text NOT NULL,
    title text NOT NULL,
    poster_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT collection_items_media_type_check CHECK ((media_type = ANY (ARRAY['movie'::text, 'tv'::text])))
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    preferences jsonb DEFAULT '{"war": true, "crime": true, "drama": true, "scifi": true, "action": true, "comedy": true, "horror": true, "fantasy": true, "romance": true, "western": true, "thriller": true, "adventure": true}'::jsonb,
    updated_at timestamp with time zone,
    display_name text,
    avatar_url text
);

CREATE TABLE IF NOT EXISTS public.ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    media_id integer NOT NULL,
    media_type text NOT NULL,
    rating smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ratings_media_type_check CHECK ((media_type = ANY (ARRAY['movie'::text, 'tv'::text]))),
    CONSTRAINT ratings_rating_check CHECK ((rating = ANY (ARRAY['-1'::integer, 1])))
);

CREATE TABLE IF NOT EXISTS public.watch_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    media_id integer NOT NULL,
    media_type text NOT NULL,
    title text NOT NULL,
    poster_path text,
    season_number integer,
    episode_number integer,
    progress real DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    CONSTRAINT watch_history_media_type_check CHECK ((media_type = ANY (ARRAY['movie'::text, 'tv'::text, 'anime'::text])))
);

ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);
ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_user_id_media_id_media_type_key UNIQUE (user_id, media_id, media_type);
ALTER TABLE public.collections ADD CONSTRAINT collections_pkey PRIMARY KEY (id);
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_pkey PRIMARY KEY (id);
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_collection_id_media_id_media_type_key UNIQUE (collection_id, media_id, media_type);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.ratings ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);
ALTER TABLE public.ratings ADD CONSTRAINT ratings_user_id_media_id_media_type_key UNIQUE (user_id, media_id, media_type);
ALTER TABLE public.watch_history ADD CONSTRAINT watch_history_pkey PRIMARY KEY (id);
ALTER TABLE public.watch_history ADD CONSTRAINT watch_history_user_id_media_id_media_type_key UNIQUE (user_id, media_id, media_type);

ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.watch_history ADD CONSTRAINT watch_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watch_history TO authenticated;
GRANT ALL ON public.bookmarks, public.collections, public.collection_items, public.profiles, public.ratings, public.watch_history TO service_role;

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own collections" ON public.collections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON public.collections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own collection items" ON public.collection_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collection items" ON public.collection_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own collection items" ON public.collection_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can view own ratings" ON public.ratings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watch history" ON public.watch_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watch history" ON public.watch_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watch history" ON public.watch_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watch history" ON public.watch_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
