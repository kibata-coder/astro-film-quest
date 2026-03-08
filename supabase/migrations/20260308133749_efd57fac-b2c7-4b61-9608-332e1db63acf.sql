-- Create ratings table for thumbs up/down
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  media_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  rating smallint NOT NULL CHECK (rating IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, media_id, media_type)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view rating counts (public feature)
CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT
USING (true);

-- Auth users can insert their own ratings
CREATE POLICY "Users can insert own ratings"
ON public.ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Auth users can update their own ratings
CREATE POLICY "Users can update own ratings"
ON public.ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Auth users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
ON public.ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);