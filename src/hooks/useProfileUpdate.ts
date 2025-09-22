// hooks/useProfileUpdate.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useWardrobe } from '../contexts/WardrobeContext';

export const useProfileUpdate = () => {
  const [saving, setSaving] = useState(false);
  const { user, setUser } = useWardrobe();

  const updateProfile = async (displayName: string) => {
    console.log('Hook - supabase object:', supabase); // Add this debug
    console.log('Hook - supabase.auth:', supabase.auth); // Add this debug

    if (!user) return { success: false, error: 'No user found' };

    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setSaving(false);
    }
  };

  return { updateProfile, saving };
};
