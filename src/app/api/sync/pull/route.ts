import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// This endpoint sends recent changes to offline clients
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lastSyncTime } = await req.json().catch(() => ({}));
    const userId = session.user.id;

    // Get all changes since last sync
    const since = lastSyncTime ? new Date(lastSyncTime) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

    const [leads, payments, reminders] = await Promise.all([
      prisma.lead.findMany({
        where: {
          userId,
          updatedAt: { gte: since },
        },
      }),
      prisma.payment.findMany({
        where: {
          userId,
          updatedAt: { gte: since },
        },
      }),
      prisma.reminder.findMany({
        where: {
          userId,
          updatedAt: { gte: since },
        },
      }),
    ]);

    // Format changes
    const changes = [
      ...leads.map((lead) => ({
        operation: 'UPDATE',
        model: 'Lead',
        recordId: lead.id,
        data: lead,
      })),
      ...payments.map((payment) => ({
        operation: 'UPDATE',
        model: 'Payment',
        recordId: payment.id,
        data: payment,
      })),
      ...reminders.map((reminder) => ({
        operation: 'UPDATE',
        model: 'Reminder',
        recordId: reminder.id,
        data: reminder,
      })),
    ];

    return NextResponse.json({ 
      success: true, 
      changes,
      syncTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Sync pull error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
