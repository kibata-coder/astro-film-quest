import { supabase } from '@/integrations/supabase/client';

export interface Collection {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  created_at: string;
}

export async function getCollections(): Promise<Collection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) { console.error(error); return []; }
  return (data || []) as Collection[];
}

export async function createCollection(name: string): Promise<Collection | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: user.id, name })
    .select()
    .single();

  if (error) { console.error(error); return null; }
  return data as Collection;
}

export async function renameCollection(id: string, name: string): Promise<boolean> {
  const { error } = await supabase
    .from('collections')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  return !error;
}

export async function getCollectionItems(collectionId: string): Promise<CollectionItem[]> {
  const { data, error } = await supabase
    .from('collection_items')
    .select('*')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return (data || []) as CollectionItem[];
}

export async function addToCollection(
  collectionId: string,
  mediaId: number,
  mediaType: string,
  title: string,
  posterPath: string | null
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      user_id: user.id,
      media_id: mediaId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
    });

  if (error) {
    // Duplicate - already in collection
    if (error.code === '23505') return true;
    console.error(error);
    return false;
  }
  return true;
}

export async function removeFromCollection(collectionId: string, mediaId: number, mediaType: string): Promise<boolean> {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType);

  return !error;
}

export async function getItemCollections(mediaId: number, mediaType: string): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collection_items')
    .select('collection_id')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .eq('user_id', user.id);

  if (error) { console.error(error); return []; }
  return (data || []).map(d => d.collection_id);
}
