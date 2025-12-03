import prisma from "@/lib/prisma";
import { sendLeadCreated } from "@/lib/zapier";
import { sendToGoogleSheets } from "@/app/api/integrations/google-sheets/route";
import { Tag } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
     const session = await auth();
     const user = session?.user;
    
        if (!user || !user.id) {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
        }
    
        const userId = user.id as string;
        const userRole = user.role as string;

    let leads: any[] = [];
    
    try {
      if (userRole === "ADMIN") {
        // Admin sees ALL leads from all users
        leads = await prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
      } else {
        // Employee sees only their own leads
        leads = await prisma.lead.findMany({
          where: { userId: userId },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (dbErr) {
      console.error("Database unavailable for leads — returning empty list:", dbErr);
      // Return empty array when DB is unavailable instead of crashing
      leads = [];
    }

    // Ensure dates are properly serialized with type-safe access
    const serializedLeads = leads.map(lead => ({
      ...lead,
      createdAt: lead.createdAt ? lead.createdAt.toISOString() : null,
      updatedAt: lead.updatedAt ? lead.updatedAt.toISOString() : null,
      leadsCreatedDate: (lead as any).leadsCreatedDate ? (lead as any).leadsCreatedDate.toISOString() : null,
      leadsUpdatedDates: (lead as any).leadsUpdatedDates ? (lead as any).leadsUpdatedDates.toISOString() : null,
      enquiryDate: (lead as any).enquiryDate ? (lead as any).enquiryDate.toISOString() : null,
      bookingDate: (lead as any).bookingDate ? (lead as any).bookingDate.toISOString() : null,
      checkInDates: (lead as any).checkInDates ? (lead as any).checkInDates.toISOString() : null,
    }));

    return NextResponse.json(serializedLeads);
  } catch (error: any) {
    console.error("Leads API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

interface leaducreate {
  name: string;
  email: string;
  phone: string;
  company: string;
  tag: Tag;
  source: string;
  notes: string;
  duration: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as leaducreate
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id as string;

    try {
      const created = await prisma.lead.create({
        data: { ...body, userId: userId },
      });

      // Fire-and-forget: notify integrations of the newly created lead
      try {
        void sendLeadCreated(created);
        void sendToGoogleSheets(created);
      } catch (notifyErr) {
        console.error("Failed to notify integrations:", notifyErr);
      }

      // Serialize dates for consistent response with type-safe access
      const serializedLead = {
        ...created,
        createdAt: created.createdAt ? created.createdAt.toISOString() : null,
        updatedAt: created.updatedAt ? created.updatedAt.toISOString() : null,
        leadsCreatedDate: (created as any).leadsCreatedDate ? (created as any).leadsCreatedDate.toISOString() : null,
        leadsUpdatedDates: (created as any).leadsUpdatedDates ? (created as any).leadsUpdatedDates.toISOString() : null,
        enquiryDate: (created as any).enquiryDate ? (created as any).enquiryDate.toISOString() : null,
        bookingDate: (created as any).bookingDate ? (created as any).bookingDate.toISOString() : null,
        checkInDates: (created as any).checkInDates ? (created as any).checkInDates.toISOString() : null,
      };

      return NextResponse.json(serializedLead);
    } catch (dbErr: any) {
      console.error("Database error for lead creation:", dbErr);
      
      // Handle unique constraint violation (duplicate email)
      if (dbErr.code === 'P2002' && dbErr.meta?.target?.includes('email')) {
        return NextResponse.json({
          success: false,
          error: "A lead with this email address already exists. Please use a different email or update the existing lead.",
          code: "DUPLICATE_EMAIL"
        }, { status: 409 });
      }
      
      // Handle other database errors
      return NextResponse.json({
        success: false,
        error: "Database is currently unavailable. Please try creating the lead later when the database connection is restored.",
        details: "The database server appears to be unreachable. This may be a temporary connectivity issue."
      }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}