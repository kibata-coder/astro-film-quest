import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ThumbsUp, ThumbsDown, Bookmark, ListVideo, Clock } from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  sign_up_date: string;
  last_sign_in_at: string | null;
  watch_count: number;
  rating_count: number;
  bookmark_count: number;
  collection_count: number;
}

interface WatchRow {
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  season_number: number | null;
  episode_number: number | null;
  progress: number | null;
  duration: number | null;
  is_anime: boolean | null;
  updated_at: string;
}

interface RatingRow {
  media_id: number;
  media_type: string;
  rating: number;
  updated_at: string;
}

interface BookmarkRow {
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  created_at: string;
}

interface CollectionRow {
  id: string;
  name: string;
  created_at: string;
  item_count: number;
}

interface Activity {
  watch_history: WatchRow[];
  ratings: RatingRow[];
  bookmarks: BookmarkRow[];
  collections: CollectionRow[];
}

const posterUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w92${path}` : null;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : 'Never';

const Poster = ({ path, title }: { path: string | null; title: string }) => {
  const url = posterUrl(path);
  return url ? (
    <img
      src={url}
      alt={title}
      loading="lazy"
      className="h-16 w-11 flex-shrink-0 rounded object-cover"
    />
  ) : (
    <div className="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
      N/A
    </div>
  );
};

const Empty = ({ text }: { text: string }) => (
  <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>
);

interface Props {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

const UserDetailSheet = ({ userId, onOpenChange }: Props) => {
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_user_detail', {
        target_user_id: userId as string,
      });
      if (error) throw error;
      return (data as unknown as UserDetail[])?.[0] ?? null;
    },
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-user-activity', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_user_activity', {
        target_user_id: userId as string,
      });
      if (error) throw error;
      return data as unknown as Activity;
    },
  });

  const loading = detailLoading || activityLoading;

  return (
    <Sheet open={!!userId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-hidden p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-6 pb-4 text-left">
            <SheetTitle className="truncate text-xl">
              {detail?.display_name || detail?.email || 'User details'}
            </SheetTitle>
            <SheetDescription className="font-mono text-xs">
              {detail?.email ?? userId}
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
              <div className="px-6 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">Watching</TabsTrigger>
                  <TabsTrigger value="ratings" className="flex-1">Ratings</TabsTrigger>
                  <TabsTrigger value="lists" className="flex-1">Lists</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 pt-4">
                  <TabsContent value="overview" className="mt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Items watched', value: detail?.watch_count ?? 0 },
                        { label: 'Ratings', value: detail?.rating_count ?? 0 },
                        { label: 'Bookmarks', value: detail?.bookmark_count ?? 0 },
                        { label: 'Collections', value: detail?.collection_count ?? 0 },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border bg-card/50 p-4">
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <dl className="space-y-3 rounded-lg border bg-card/50 p-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Signed up</dt>
                        <dd>{formatDate(detail?.sign_up_date ?? null)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Last signed in</dt>
                        <dd>{formatDate(detail?.last_sign_in_at ?? null)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Display name</dt>
                        <dd>{detail?.display_name || '—'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">User ID</dt>
                        <dd className="truncate font-mono text-xs">{detail?.id}</dd>
                      </div>
                    </dl>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0 space-y-3">
                    {!activity?.watch_history.length ? (
                      <Empty text="Nothing watched yet." />
                    ) : (
                      activity.watch_history.map((row) => (
                        <div
                          key={`${row.media_type}-${row.media_id}`}
                          className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
                        >
                          <Poster path={row.poster_path} title={row.title} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{row.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="capitalize">
                                {row.is_anime ? 'anime' : row.media_type}
                              </Badge>
                              {row.season_number != null && row.episode_number != null && (
                                <span>S{row.season_number} E{row.episode_number}</span>
                              )}
                              <span>{Math.round((row.progress ?? 0) * 100)}% watched</span>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(row.updated_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="ratings" className="mt-0 space-y-3">
                    {!activity?.ratings.length ? (
                      <Empty text="No ratings yet." />
                    ) : (
                      activity.ratings.map((row) => (
                        <div
                          key={`${row.media_type}-${row.media_id}`}
                          className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 text-sm"
                        >
                          {row.rating > 0 ? (
                            <ThumbsUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className="flex-1 capitalize">
                            {row.media_type} #{row.media_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(row.updated_at)}
                          </span>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="lists" className="mt-0 space-y-6">
                    <section className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Bookmark className="h-4 w-4" /> Bookmarks
                      </h3>
                      {!activity?.bookmarks.length ? (
                        <Empty text="No bookmarks." />
                      ) : (
                        activity.bookmarks.map((row) => (
                          <div
                            key={`${row.media_type}-${row.media_id}`}
                            className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
                          >
                            <Poster path={row.poster_path} title={row.title} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{row.title}</p>
                              <p className="text-xs capitalize text-muted-foreground">
                                {row.media_type} · {formatDate(row.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </section>

                    <section className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <ListVideo className="h-4 w-4" /> Collections
                      </h3>
                      {!activity?.collections.length ? (
                        <Empty text="No collections." />
                      ) : (
                        activity.collections.map((row) => (
                          <div
                            key={row.id}
                            className="flex items-center justify-between rounded-lg border bg-card/50 p-3 text-sm"
                          >
                            <span className="truncate font-medium">{row.name}</span>
                            <Badge variant="secondary">{row.item_count} items</Badge>
                          </div>
                        ))
                      )}
                    </section>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserDetailSheet;
