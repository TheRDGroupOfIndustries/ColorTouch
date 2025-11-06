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

    const wptoken = await prisma.whatsappToken.findMany({
      where: { userId: userId }
    });


    return NextResponse.json(wptoken);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token: string };
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.userId as string;

    const savedToken = await prisma.whatsappToken.upsert({
      where: { userId },
      update: { token: body.token },
      create: { token: body.token, userId },
    });

    return NextResponse.json(savedToken);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}