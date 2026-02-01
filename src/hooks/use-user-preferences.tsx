import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (data?.preferences) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...(data.preferences as object) });
        }
      } catch (err) {
        console.error('Failed to load preferences', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const toggleSection = async (key: keyof UserPreferences) => {
    if (!user) return;
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, preferences: newPrefs as any, updated_at: new Date().toISOString() });
      if (error) throw error;
    } catch (err) {
      toast.error("Failed to save setting");
      setPreferences(preferences);
    }
  };

  return { preferences, loading, toggleSection };
}
