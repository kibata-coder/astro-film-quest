import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBookmarks } from '@/lib/bookmarks';
import {
  getCollections,
  getCollectionItems,
  deleteCollection,
  renameCollection,
  removeFromCollection,
  type Collection,
  type CollectionItem,
} from '@/lib/collections';
import Layout from '@/components/Layout';
import MediaCard from '@/components/MediaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/features/auth';
import { useMedia } from '@/features/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Movie, TVShow } from '@/lib/tmdb';

const MyList = () => {
  const { user } = useAuth();
  const { openMovieModal, openTVModal } = useMedia();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('bookmarks');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', user?.id],
    queryFn: getCollections,
    enabled: !!user,
  });

  const handleItemClick = (item: { media_id: number; media_type: string; title: string; poster_path: string | null }) => {
    if (item.media_type === 'movie') {
      openMovieModal({
        id: item.media_id, title: item.title, poster_path: item.poster_path,
        vote_average: 0, release_date: '', overview: '', backdrop_path: null,
      } as Movie);
    } else {
      openTVModal({
        id: item.media_id, name: item.title, poster_path: item.poster_path,
        vote_average: 0, first_air_date: '', overview: '', backdrop_path: null,
      } as TVShow);
    }
  };

  const handleRename = async (col: Collection) => {
    if (!editName.trim() || editName.trim() === col.name) {
      setEditingId(null);
      return;
    }
    const ok = await renameCollection(col.id, editName.trim());
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: 'Collection renamed' });
    }
    setEditingId(null);
  };

  const handleDelete = async (col: Collection) => {
    const ok = await deleteCollection(col.id);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      if (activeTab === col.id) setActiveTab('bookmarks');
      toast({ title: `"${col.name}" deleted` });
    }
  };

  if (!user) {
    return (
      <Layout>
        <main className="pt-24 px-4 md:px-12 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Please Log In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your lists.</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="pt-24 px-4 md:px-12 pb-12">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My List</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-muted/50">
            <TabsTrigger value="bookmarks" className="text-sm">Bookmarks</TabsTrigger>
            {collections?.map(col => (
              <TabsTrigger key={col.id} value={col.id} className="text-sm">{col.name}</TabsTrigger>
            ))}
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {bookmarksLoading ? <LoadingSpinner /> : (
              bookmarks && bookmarks.length > 0 ? (
                <MediaGrid items={bookmarks} onItemClick={handleItemClick} />
              ) : (
                <EmptyState message="You haven't added any movies or shows to your list yet." />
              )
            )}
          </TabsContent>

          {/* Collection Tabs */}
          {collections?.map(col => (
            <TabsContent key={col.id} value={col.id}>
              <CollectionHeader
                collection={col}
                editingId={editingId}
                editName={editName}
                onStartEdit={() => { setEditingId(col.id); setEditName(col.name); }}
                onCancelEdit={() => setEditingId(null)}
                onEditNameChange={setEditName}
                onRename={() => handleRename(col)}
                onDelete={() => handleDelete(col)}
              />
              <CollectionContent
                collectionId={col.id}
                userId={user.id}
                onItemClick={handleItemClick}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </Layout>
  );
};

// --- Sub-components ---

function MediaGrid({ items, onItemClick, onRemove }: {
  items: any[];
  onItemClick: (item: any) => void;
  onRemove?: (item: any) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {items.map((item) => (
        <div key={`${item.media_type}-${item.media_id}`} className="relative group/card">
          <MediaCard
            item={{
              id: item.media_id,
              title: item.title,
              name: item.title,
              poster_path: item.poster_path,
              vote_average: 0,
              release_date: '',
              first_air_date: '',
            } as any}
            onClick={() => onItemClick(item)}
          />
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(item); }}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-destructive"
              title="Remove from collection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );
}

function CollectionHeader({
  collection, editingId, editName,
  onStartEdit, onCancelEdit, onEditNameChange, onRename, onDelete,
}: {
  collection: Collection;
  editingId: string | null;
  editName: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (v: string) => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {editingId === collection.id ? (
        <div className="flex items-center gap-2">
          <Input
            value={editName}
            onChange={e => onEditNameChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onRename()}
            className="w-48 h-8"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={onRename}>Save</Button>
          <Button size="sm" variant="ghost" onClick={onCancelEdit}><X className="w-4 h-4" /></Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border-border">
            <DropdownMenuItem onClick={onStartEdit} className="cursor-pointer">
              <Pencil className="w-4 h-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function CollectionContent({
  collectionId, userId, onItemClick,
}: {
  collectionId: string;
  userId: string;
  onItemClick: (item: any) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery({
    queryKey: ['collection-items', collectionId],
    queryFn: () => getCollectionItems(collectionId),
    enabled: !!collectionId,
  });

  const handleRemove = async (item: any) => {
    const ok = await removeFromCollection(collectionId, item.media_id, item.media_type);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ['collection-items', collectionId] });
      toast({ title: `Removed "${item.title}"` });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!items || items.length === 0) return <EmptyState message="This collection is empty. Add items from movie or TV show details." />;

  return <MediaGrid items={items} onItemClick={onItemClick} onRemove={handleRemove} />;
}

export default MyList;
