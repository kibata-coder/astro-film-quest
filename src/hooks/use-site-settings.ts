import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ADMIN_EMAIL = 'kibata988@gmail.com';

export interface SiteSettings {
  id: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  updated_at: string;
}

export const siteSettingsKey = ['site-settings'] as const;

async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('id, maintenance_mode, maintenance_message, updated_at')
    .eq('id', 'global')
    .maybeSingle();

  if (error) throw error;
  return data as SiteSettings | null;
}

/**
 * Reads the single global site settings row and keeps it live via Realtime,
 * so flipping maintenance mode reaches visitors without a reload.
 */
export function useSiteSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: siteSettingsKey,
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60,
    retry: 1,
  });

  useEffect(() => {
    const channel = supabase
      .channel('site-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          const next = payload.new as SiteSettings | undefined;
          if (next?.id === 'global') {
            queryClient.setQueryData(siteSettingsKey, next);
          } else {
            queryClient.invalidateQueries({ queryKey: siteSettingsKey });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
