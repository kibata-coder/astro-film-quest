
ALTER TABLE public.watch_history
  ALTER COLUMN progress TYPE real USING progress::real;

ALTER TABLE public.watch_history
  ADD COLUMN IF NOT EXISTS duration integer NOT NULL DEFAULT 0;
