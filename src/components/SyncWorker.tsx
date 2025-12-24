'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { syncService } from '@/lib/syncService';

/**
 * Background sync worker component
 * DISABLED aggressive sync to prevent page refresh loops
 * Sync is now only triggered manually by user
 */
export function SyncWorker() {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    // Only sync once per session, when user is authenticated
    if (status !== 'authenticated' || !session || syncedRef.current) {
      return;
    }

    // Mark as synced to prevent multiple syncs
    syncedRef.current = true;

    // Single initial sync after 5 seconds (one-time only)
    const initialSyncTimeout = setTimeout(() => {
      if (typeof window !== 'undefined' && navigator.onLine) {
        syncService.triggerSync().catch(console.error);
      }
    }, 5000);

    return () => {
      clearTimeout(initialSyncTimeout);
    };
  }, [session, status]);

  return null; // This component doesn't render anything
}
