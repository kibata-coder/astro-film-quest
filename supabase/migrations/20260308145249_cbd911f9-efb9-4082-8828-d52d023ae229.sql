
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- === BOOKMARKS ===
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- === RATINGS ===
DROP POLICY IF EXISTS "Users can view own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.ratings;

CREATE POLICY "Users can view own ratings" ON public.ratings AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ratings" ON public.ratings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.ratings AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON public.ratings AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- === COLLECTION_ITEMS ===
DROP POLICY IF EXISTS "Users can view own collection items" ON public.collection_items;
DROP POLICY IF EXISTS "Users can insert own collection items" ON public.collection_items;
DROP POLICY IF EXISTS "Users can delete own collection items" ON public.collection_items;

CREATE POLICY "Users can view own collection items" ON public.collection_items AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collection items" ON public.collection_items AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own collection items" ON public.collection_items AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- === WATCH_HISTORY ===
DROP POLICY IF EXISTS "Users can view own history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can view their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can insert/update their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can update own history" ON public.watch_history;

CREATE POLICY "Users can view own watch history" ON public.watch_history AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watch history" ON public.watch_history AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watch history" ON public.watch_history AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- === COLLECTIONS ===
DROP POLICY IF EXISTS "Users can view own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;

CREATE POLICY "Users can view own collections" ON public.collections AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON public.collections AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- === PROFILES ===
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = id);
