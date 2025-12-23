'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { syncService } from '@/lib/syncService';

/**
 * Background sync worker component
 * Auto-syncs when online and periodically checks for changes
 */
export function SyncWorker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only sync if user is authenticated
    if (status !== 'authenticated' || !session) {
      return;
    }

    // Trigger initial sync on mount if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      syncService.triggerSync();
    }

    // Set up periodic sync every 5 minutes
    const syncInterval = setInterval(() => {
      if (typeof window !== 'undefined' && navigator.onLine) {
        syncService.triggerSync();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) {
        syncService.triggerSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, status]);

  return null; // This component doesn't render anything
}
