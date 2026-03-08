import { useState, useEffect } from 'react';
import { FolderPlus, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/features/auth';
import {
  getCollections,
  createCollection,
  addToCollection,
  removeFromCollection,
  getItemCollections,
  type Collection,
} from '@/lib/collections';
import { useToast } from '@/hooks/use-toast';

interface AddToCollectionDialogProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
}

const AddToCollectionDialog = ({ mediaId, mediaType, title, posterPath }: AddToCollectionDialogProps) => {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      Promise.all([getCollections(), getItemCollections(mediaId, mediaType)])
        .then(([cols, ids]) => {
          setCollections(cols);
          setActiveIds(ids);
        })
        .finally(() => setLoading(false));
    }
  }, [open, user, mediaId, mediaType]);

  const handleToggle = async (collectionId: string) => {
    const isActive = activeIds.includes(collectionId);
    if (isActive) {
      const ok = await removeFromCollection(collectionId, mediaId, mediaType);
      if (ok) setActiveIds(prev => prev.filter(id => id !== collectionId));
    } else {
      const ok = await addToCollection(collectionId, mediaId, mediaType, title, posterPath);
      if (ok) setActiveIds(prev => [...prev, collectionId]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const col = await createCollection(newName.trim());
    if (col) {
      setCollections(prev => [...prev, col]);
      // Auto-add item to new collection
      const ok = await addToCollection(col.id, mediaId, mediaType, title, posterPath);
      if (ok) setActiveIds(prev => [...prev, col.id]);
      setNewName('');
      toast({ title: `Added to "${col.name}"` });
    }
    setCreating(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (value && !user) {
      openAuthModal();
      return;
    }
    setOpen(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2.5 text-muted-foreground hover:text-foreground">
          <FolderPlus className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Save</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Save to Collection</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {collections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No collections yet. Create one below!</p>
            )}
            {collections.map(col => {
              const isActive = activeIds.includes(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md border transition-colors text-sm ${
                    isActive
                      ? 'border-primary/50 bg-primary/10 text-foreground'
                      : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="truncate">{col.name}</span>
                  {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New collection name..."
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button size="icon" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
