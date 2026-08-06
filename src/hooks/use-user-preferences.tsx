import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserPreferences {
  action: boolean;
  adventure: boolean;
  comedy: boolean;
  drama: boolean;
  horror: boolean;
  scifi: boolean;
  fantasy: boolean;
  romance: boolean;
  thriller: boolean;
  western: boolean;
  crime: boolean;
  war: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  action: true,
  adventure: true,
  comedy: true,
  drama: true,
  horror: true,
  scifi: true,
  fantasy: true,
  romance: true,
  thriller: true,
  western: true,
  crime: true,
  war: true,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const queryKey = ['profile-preferences', userId] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!userId,
    // Preferences change only when this user toggles them, so never refetch on
    // mount/focus. This used to fire thousands of profile reads per day.
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    queryFn: async (): Promise<UserPreferences> => {
      const { data: row, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId!)
        .maybeSingle();

      if (error) throw error;

      if (row?.preferences && typeof row.preferences === 'object') {
        return { ...DEFAULT_PREFERENCES, ...(row.preferences as object) };
      }
      return DEFAULT_PREFERENCES;
    },
  });

  const preferences = data ?? DEFAULT_PREFERENCES;
  const loading = !!userId && isLoading;

  const toggleSection = async (key: keyof UserPreferences) => {
    if (!userId) return;
    const previous = preferences;
    const newPrefs = { ...preferences, [key]: !preferences[key] };

    // Optimistic write-through so no refetch is needed.
    queryClient.setQueryData(queryKey, newPrefs);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        preferences: newPrefs,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      queryClient.setQueryData(queryKey, previous);
      toast.error('Failed to save setting');
    }
  };

  return { preferences, loading, toggleSection };
}
