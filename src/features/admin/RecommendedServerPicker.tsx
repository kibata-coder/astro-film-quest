import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings, siteSettingsKey, type SiteSettings } from '@/hooks/use-site-settings';
import { getProviders, getRecommendedIds } from '@/lib/vidsrc';
import { Check, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecommendedServerPicker = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const providers = getProviders();
  const current = getRecommendedIds(settings);
  const nameOf = (id: string) => providers.find((p) => p.id === id)?.name ?? id;

  const mutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          recommended_provider_ids: ids,
          recommended_provider_id: ids[0],
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', 'global')
        .select()
        .single();
      if (error) throw error;
      return data as unknown as SiteSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(siteSettingsKey, data);
      toast({
        title: 'Recommended servers saved',
        description: getRecommendedIds(data).map(nameOf).join(', '),
      });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Could not save', description: error.message });
    },
  });

  const toggle = (id: string) => {
    if (mutation.isPending) return;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    if (next.length === 0) {
      toast({ variant: 'destructive', title: 'Keep at least one', description: 'At least one server must stay recommended.' });
      return;
    }
    mutation.mutate(next);
  };

  return (
    <Card className="mb-8 bg-card/50 backdrop-blur border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-4 w-4 text-primary" />
          Recommended streaming servers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Tap to turn servers on or off. Recommended servers show first (in the order you picked them) with a Recommended badge for every movie and TV show.
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Now recommended: </span>
          <span className="font-medium">{current.map(nameOf).join(', ')}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {providers.map((p) => {
            const pos = current.indexOf(p.id);
            const on = pos >= 0;
            return (
              <button
                key={p.id}
                type="button"
                disabled={mutation.isPending || !settings}
                onClick={() => toggle(p.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:opacity-60',
                  on ? 'border-primary bg-primary/15' : 'border-border bg-muted/30 hover:bg-muted/60'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-bold',
                    on ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                  )}
                >
                  {on ? pos + 1 : null}
                </span>
                <span className="flex-1 break-words">{p.name}</span>
                {on && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedServerPicker;
