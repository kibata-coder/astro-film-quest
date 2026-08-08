import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings, siteSettingsKey, type SiteSettings } from '@/hooks/use-site-settings';
import { Wrench } from 'lucide-react';

const MaintenanceToggle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(settings?.maintenance_message ?? '');
  }, [settings?.maintenance_message]);

  const mutation = useMutation({
    mutationFn: async (patch: Partial<Pick<SiteSettings, 'maintenance_mode' | 'maintenance_message'>>) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', 'global')
        .select()
        .single();

      if (error) throw error;
      return data as SiteSettings;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(siteSettingsKey, data);
      toast({
        title: 'maintenance_mode' in variables
          ? variables.maintenance_mode
            ? 'Maintenance mode ON'
            : 'Maintenance mode OFF'
          : 'Message saved',
        description: 'maintenance_mode' in variables
          ? variables.maintenance_mode
            ? 'Visitors now see the maintenance page.'
            : 'The site is live again for everyone.'
          : 'Visitors will see your updated message.',
      });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: siteSettingsKey });
      toast({
        variant: 'destructive',
        title: 'Could not save',
        description: error.message,
      });
    },
  });

  const isOn = settings?.maintenance_mode ?? false;

  return (
    <Card className="mb-8 bg-card/50 backdrop-blur border-amber-500/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="h-4 w-4 text-amber-500" />
          Maintenance mode
        </CardTitle>
        <div className="flex items-center gap-3">
          <Label htmlFor="maintenance-switch" className="text-sm text-muted-foreground">
            {isOn ? 'On' : 'Off'}
          </Label>
          <Switch
            id="maintenance-switch"
            checked={isOn}
            disabled={mutation.isPending || !settings}
            onCheckedChange={(checked) => mutation.mutate({ maintenance_mode: checked })}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          When on, visitors see a maintenance page. You keep full access to the site.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={message}
            maxLength={200}
            placeholder="Optional message shown to visitors"
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="secondary"
            disabled={mutation.isPending || message === (settings?.maintenance_message ?? '')}
            onClick={() => mutation.mutate({ maintenance_message: message.trim() || null })}
          >
            Save message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceToggle;
