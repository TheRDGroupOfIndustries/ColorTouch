import prisma from "@/lib/prisma";
import { Tag } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
        if (!token || !token.userId) {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
        }
    
        const userId = token.userId as string;

    let leads: any[] = [];
    
    try {
      leads = await prisma.lead.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr) {
      console.error("Database unavailable for leads — returning empty list:", dbErr);
      // Return empty array when DB is unavailable instead of crashing
      leads = [];
    }

    return NextResponse.json(leads);
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.userId as string;

    const created = await prisma.lead.create({
      data: { ...body, userId: userId },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}