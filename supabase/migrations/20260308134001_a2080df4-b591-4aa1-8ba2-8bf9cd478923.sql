-- Collections table
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
ON public.collections FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
ON public.collections FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
ON public.collections FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
ON public.collections FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Collection items table
CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  media_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title text NOT NULL,
  poster_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, media_id, media_type)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collection items"
ON public.collection_items FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collection items"
ON public.collection_items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collection items"
ON public.collection_items FOR DELETE TO authenticated
USING (auth.uid() = user_id);