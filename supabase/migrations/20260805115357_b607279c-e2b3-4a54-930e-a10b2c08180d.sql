ALTER TABLE public.watch_history
  ADD COLUMN IF NOT EXISTS is_anime boolean;