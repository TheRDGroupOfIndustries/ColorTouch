import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { enhancedSyncService } from '@/lib/enhanced-sync';

/**
 * GET /api/sync/stats
 * Get sync statistics
 */
export async function GET(req: Request) {
  try {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await enhancedSyncService.getSyncStats();

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error getting sync stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get sync stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync/trigger
 * Manually trigger synchronization
 */
export async function POST(req: Request) {
  try {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await enhancedSyncService.sync();

    return NextResponse.json({
      success: result.success,
      synced: result.synced,
      failed: result.failed,
      conflicts: result.conflicts,
      message: `Synced ${result.synced} items, ${result.failed} failed, ${result.conflicts} conflicts`,
    });
  } catch (error: any) {
    console.error('Error triggering sync:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to trigger sync' },
      { status: 500 }
    );
  }
}
