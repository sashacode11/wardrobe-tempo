// hooks/useConnectionStatus.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check Supabase connection periodically
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .select('count')
          .limit(1)
          .single();

        if (error) {
          setIsSupabaseConnected(false);
        } else {
          setIsSupabaseConnected(true);
          setLastSyncTime(new Date());
        }
      } catch (error) {
        setIsSupabaseConnected(false);
      }
    };

    // Check immediately and then every 30 seconds when online
    if (isOnline) {
      checkSupabaseConnection();
      const interval = setInterval(checkSupabaseConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  return {
    isOnline,
    isSupabaseConnected,
    lastSyncTime,
    isConnected: isOnline && isSupabaseConnected,
  };
};
