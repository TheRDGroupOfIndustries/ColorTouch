import prisma, { withRetry } from "@/lib/prisma";
import { sendLeadCreated } from "@/lib/zapier";
import { sendToGoogleSheets } from "@/app/api/integrations/google-sheets/route";
import { sendLeadNotificationEmail } from "@/lib/sendEmail";
import { Tag, Role } from "@prisma/client";
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
      const selectFields = {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        amount: true,
        source: true,
        notes: true,
        tag: true,
        status: true,
        duration: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        leadsCreatedDate: true,
        leadsUpdatedDates: true,
        enquiryDate: true,
        bookingDate: true,
        checkInDates: true,
      };

      if (userRole === "ADMIN") {
        // Admin sees ALL leads from all users
        leads = await withRetry(() => prisma.lead.findMany({
          select: {
            ...selectFields,
            User: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
        }));
      } else {
        // Employee sees only their own leads
        leads = await withRetry(() => prisma.lead.findMany({
          where: { userId: userId },
          select: selectFields,
          orderBy: { createdAt: "desc" },
        }));
      }
    } catch (dbErr) {
      console.error("Database unavailable for leads — returning empty list:", dbErr);
      // Return empty array when DB is unavailable instead of crashing
      leads = [];
    }

    // Ensure dates are properly serialized
    const serializedLeads = leads.map(lead => {
      const serializedLead: any = { ...lead };
      
      // Handle standard timestamps
      serializedLead.createdAt = lead.createdAt ? lead.createdAt.toISOString() : null;
      serializedLead.updatedAt = lead.updatedAt ? lead.updatedAt.toISOString() : null;
      
      // Handle custom date fields with explicit checks
      const leadAny = lead as any;
      serializedLead.leadsCreatedDate = leadAny.leadsCreatedDate && leadAny.leadsCreatedDate instanceof Date ? leadAny.leadsCreatedDate.toISOString() : null;
      serializedLead.leadsUpdatedDates = leadAny.leadsUpdatedDates && leadAny.leadsUpdatedDates instanceof Date ? leadAny.leadsUpdatedDates.toISOString() : null;
      serializedLead.enquiryDate = leadAny.enquiryDate && leadAny.enquiryDate instanceof Date ? leadAny.enquiryDate.toISOString() : null;
      serializedLead.bookingDate = leadAny.bookingDate && leadAny.bookingDate instanceof Date ? leadAny.bookingDate.toISOString() : null;
      serializedLead.checkInDates = leadAny.checkInDates && leadAny.checkInDates instanceof Date ? leadAny.checkInDates.toISOString() : null;
      
      return serializedLead;
    });

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

    // Verify the user exists in the database
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });

      if (!dbUser) {
        console.error(`User with id '${userId}' not found in database. Creating user record...`);
        // Try to create the user if they don't exist
        try {
          await prisma.user.create({
            data: {
              id: userId,
              email: user.email || `${userId}@colortouch.app`,
              name: user.name || "User",
              role: (user.role as Role) || "EMPLOYEE" as Role,
            },
          });
          console.log(`Created user record for userId: ${userId}`);
        } catch (createErr: any) {
          console.error(`Failed to create user record:`, createErr);
          return NextResponse.json(
            { success: false, error: `User account not found and could not be created. Please try logging in again.` },
            { status: 400 }
          );
        }
      }
    } catch (userCheckErr: any) {
      console.error("Error checking/creating user:", userCheckErr);
      return NextResponse.json(
        { success: false, error: "Failed to verify user account" },
        { status: 503 }
      );
    }

    try {
      // Convert date strings to ISO-8601 DateTime format for Prisma
      const convertDateToDateTime = (dateString: string | undefined): string | undefined => {
        if (!dateString) return undefined;
        // If already in ISO format, return as-is
        if (dateString.includes('T')) return dateString;
        // Convert YYYY-MM-DD to YYYY-MM-DDTHH:MM:SSZ
        return `${dateString}T00:00:00Z`;
      };

      const processedData = {
        ...body,
        userId: userId,
        enquiryDate: convertDateToDateTime(body.enquiryDate),
        bookingDate: convertDateToDateTime(body.bookingDate),
        checkInDates: convertDateToDateTime(body.checkInDates),
      };

      const created = await withRetry(() => prisma.lead.create({
        data: processedData,
      }));

      // Fire-and-forget: notify integrations of the newly created lead
      try {
        void sendLeadCreated(created);
        void sendToGoogleSheets(created);
        
        // Send email notification to the lead
        if (created.email && user.name) {
          void sendLeadNotificationEmail(
            created.email,
            created.name,
            user.name,
            {
              name: created.name,
              email: created.email,
              phone: created.phone || "",
              company: created.company || "",
              source: created.source || "",
              notes: created.notes || "",
            }
          );
        }
      } catch (notifyErr) {
        console.error("Failed to notify integrations:", notifyErr);
      }

      // Serialize dates for consistent response
      const serializedLead: any = { ...created };
      
      // Handle standard timestamps
      serializedLead.createdAt = created.createdAt ? created.createdAt.toISOString() : null;
      serializedLead.updatedAt = created.updatedAt ? created.updatedAt.toISOString() : null;
      
      // Handle custom date fields with explicit checks
      const createdAny = created as any;
      serializedLead.leadsCreatedDate = createdAny.leadsCreatedDate && createdAny.leadsCreatedDate instanceof Date ? createdAny.leadsCreatedDate.toISOString() : null;
      serializedLead.leadsUpdatedDates = createdAny.leadsUpdatedDates && createdAny.leadsUpdatedDates instanceof Date ? createdAny.leadsUpdatedDates.toISOString() : null;
      serializedLead.enquiryDate = createdAny.enquiryDate && createdAny.enquiryDate instanceof Date ? createdAny.enquiryDate.toISOString() : null;
      serializedLead.bookingDate = createdAny.bookingDate && createdAny.bookingDate instanceof Date ? createdAny.bookingDate.toISOString() : null;
      serializedLead.checkInDates = createdAny.checkInDates && createdAny.checkInDates instanceof Date ? createdAny.checkInDates.toISOString() : null;

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