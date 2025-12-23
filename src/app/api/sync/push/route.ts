import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SyncStatus } from '@prisma/client';

// This endpoint receives changes from offline clients
export async function POST(req: NextRequest) {
  try {
    const { operation, model, recordId, data, userId } = await req.json();

    if (!operation || !model || !recordId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get model reference
    const models: any = {
      Lead: prisma.lead,
      Payment: prisma.payment,
      Reminder: prisma.reminder,
    };

    const modelRef = models[model];
    if (!modelRef) {
      return NextResponse.json(
        { error: 'Invalid model' },
        { status: 400 }
      );
    }

    // Check for conflicts - compare updatedAt timestamps
    if (operation === 'UPDATE') {
      const existing = await modelRef.findUnique({ where: { id: recordId } });
      
      if (existing && data.updatedAt) {
        const existingTime = new Date(existing.updatedAt).getTime();
        const incomingTime = new Date(data.updatedAt).getTime();
        
        // If server version is newer, report conflict
        if (existingTime > incomingTime) {
          return NextResponse.json(
            { 
              error: 'Conflict detected',
              conflict: true,
              serverData: existing 
            },
            { status: 409 }
          );
        }
      }
    }

    // Apply the change
    let result;
    if (operation === 'CREATE') {
      result = await modelRef.create({
        data: {
          ...data,
          syncStatus: SyncStatus.SYNCED,
          lastSyncedAt: new Date(),
        },
      });
    } else if (operation === 'UPDATE') {
      result = await modelRef.update({
        where: { id: recordId },
        data: {
          ...data,
          syncStatus: SyncStatus.SYNCED,
          lastSyncedAt: new Date(),
        },
      });
    } else if (operation === 'DELETE') {
      result = await modelRef.delete({
        where: { id: recordId },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Sync push error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
