import prisma from "@/lib/prisma";
import { Tag } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get token using either AUTH_SECRET or NEXTAUTH_SECRET
    const token =
      (await getToken({ req, secret: process.env.AUTH_SECRET }));

    // Check both userId and sub (sub = default user ID field in NextAuth)
    const userId = (token?.userId) as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const leads = await prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error: any) {
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
    const body = (await req.json()) as leaducreate;

    const token =
      (await getToken({ req, secret: process.env.AUTH_SECRET }));

    const userId = (token?.userId || token?.sub) as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const created = await prisma.lead.create({
      data: { ...body, userId },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
