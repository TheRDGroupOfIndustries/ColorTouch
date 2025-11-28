import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for pagination
    const url = new URL(req.url);
    const since = url.searchParams.get('since'); // ISO timestamp
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Calculate the time threshold (default: last 15 minutes)
    const sinceDate = since 
      ? new Date(since)
      : new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

    try {
      // Get new leads created since the timestamp
      const leads = await prisma.lead.findMany({
        where: {
          createdAt: {
            gt: sinceDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Format for Zapier consumption
      const formattedLeads = leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        amount: lead.amount,
        source: lead.source,
        notes: lead.notes,
        tag: lead.tag,
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        assignedTo: lead.user?.name || 'Unassigned',
        // Zapier-specific meta
        zapier_meta: {
          id: lead.id,
          timestamp: lead.createdAt.toISOString()
        }
      }));

      return NextResponse.json({
        success: true,
        data: formattedLeads,
        meta: {
          since: sinceDate.toISOString(),
          count: formattedLeads.length,
          hasMore: formattedLeads.length === limit
        }
      });

    } catch (dbErr) {
      console.error("Database unavailable for Zapier poll:", dbErr);
      // Return empty array if DB is down (Neon auto-pause)
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          since: sinceDate.toISOString(),
          count: 0,
          hasMore: false,
          note: "Database temporarily unavailable"
        }
      });
    }

  } catch (err: any) {
    console.error("/api/zapier/poll error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || String(err) 
    }, { status: 500 });
  }
}

// Optional: Add POST method for webhook testing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[zapier-poll] Received test webhook:", body);
    
    return NextResponse.json({
      success: true,
      message: "Test webhook received successfully",
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err?.message || String(err) 
    }, { status: 400 });
  }
}