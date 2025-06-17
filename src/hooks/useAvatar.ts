"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';

interface Avatar {
  id: string;
  name: string;
  user_id: string;
  org_id: string | null;
  encrypted_pii: unknown;
  game_preferences: unknown;
  theme_settings: unknown;
  last_active: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UseAvatarReturn {
  avatar: Avatar | null;
  avatars: Avatar[];
  loading: boolean;
  error: Error | null;
  selectAvatar: (id: string) => Promise<void>;
  refreshAvatars: () => Promise<void>;
}

export function useAvatar(): UseAvatarReturn {
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load avatars and selected avatar on mount
  useEffect(() => {
    refreshAvatars();
  }, []);

  const refreshAvatars = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get all avatars for the current user
      const { data: avatarsData, error: avatarsError } = await supabase
        .from('avatars')
        .select('*')
        .order('created_at', { ascending: false });

      if (avatarsError) throw avatarsError;

      setAvatars(avatarsData || []);

      // Get selected avatar from localStorage
      const selectedAvatarId = localStorage.getItem('selectedAvatarId');
      if (selectedAvatarId) {
        const selectedAvatar = avatarsData?.find(a => a.id === selectedAvatarId);
        if (selectedAvatar) {
          setAvatar(selectedAvatar);
        }
      } else if (avatarsData?.length > 0) {
        // Default to first avatar if none selected
        setAvatar(avatarsData[0]);
        localStorage.setItem('selectedAvatarId', avatarsData[0].id);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load avatars');
      logger.error('Error loading avatars:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const selectedAvatar = avatars.find(a => a.id === id);
      if (!selectedAvatar) {
        throw new Error('Avatar not found');
      }

      setAvatar(selectedAvatar);
      localStorage.setItem('selectedAvatarId', id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to select avatar');
      logger.error('Error selecting avatar:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    avatar,
    avatars,
    loading,
    error,
    selectAvatar,
    refreshAvatars
  };
} 