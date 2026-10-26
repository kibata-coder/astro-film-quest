import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings, siteSettingsKey, type SiteSettings } from '@/hooks/use-site-settings';
import { getProviders, DEFAULT_RECOMMENDED_PROVIDER_ID } from '@/lib/vidsrc';
import { Server } from 'lucide-react';

const RecommendedServerPicker = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const providers = getProviders();
  const current = settings?.recommended_provider_id ?? DEFAULT_RECOMMENDED_PROVIDER_ID;

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ recommended_provider_id: id, updated_at: new Date().toISOString() })
        .eq('id', 'global')
        .select()
        .single();
      if (error) throw error;
      return data as SiteSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(siteSettingsKey, data);
      const name = providers.find((p) => p.id === data.recommended_provider_id)?.name;
      toast({ title: 'Recommended server saved', description: `${name} now shows first for everyone.` });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Could not save', description: error.message });
    },
  });

  return (
    <Card className="mb-8 bg-card/50 backdrop-blur border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-4 w-4 text-primary" />
          Recommended streaming server
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This server appears first with a Recommended badge for every movie and TV show. Other servers stay available.
        </p>
        <Select
          value={current}
          disabled={mutation.isPending || !settings}
          onValueChange={(v) => mutation.mutate(v)}
        >
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Choose a server" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default RecommendedServerPicker;
