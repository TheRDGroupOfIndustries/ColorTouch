import prisma from "@/lib/prisma";
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
    const body = (await req.json()) as { token: string; secret?: string; provider?: string; phoneNumber?: string };
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id as string;

    // Store token in a way that can include provider info
    // For Twilio: "accountSid:authToken:phoneNumber:twilio" format
    // For WhatsApp Business API: "accessToken:phoneNumberId:whatsapp-business-api" format
    // For others: just the token
    const tokenTrimmed = (body.token || "").trim();
    const secretTrimmed = (body.secret || "").trim();
    const phoneTrimmed = (body.phoneNumber || "").trim();

    let tokenToStore = tokenTrimmed;
    
    if (body.provider === 'twilio' && secretTrimmed) {
      tokenToStore = `${tokenTrimmed}:${secretTrimmed}:${phoneTrimmed}:twilio`;
    } else if (body.provider === 'whatsapp-business-api' && secretTrimmed) {
      tokenToStore = `${tokenTrimmed}:${secretTrimmed}:whatsapp-business-api`;
    }

    const savedToken = await prisma.whatsappToken.upsert({
      where: { userId },
      update: { token: tokenToStore },
      create: { token: tokenToStore, userId },
    });

    return NextResponse.json(savedToken);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
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

    await prisma.whatsappToken.deleteMany({ where: { userId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}