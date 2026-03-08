-- Fix: Restrict ratings SELECT to only own ratings
DROP POLICY "Authenticated users can view ratings" ON public.ratings;

CREATE POLICY "Users can view own ratings"
ON public.ratings FOR SELECT TO authenticated
USING (auth.uid() = user_id);