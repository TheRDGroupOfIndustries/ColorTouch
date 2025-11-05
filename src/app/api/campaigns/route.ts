import prisma from "@/lib/prisma";
import { CampaignType, MessageType, Priority, User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

interface CampaignCreate {
  campaignName: string;
  description?: string;
  campaignType: CampaignType;
  priority: Priority;
  messageType: MessageType;
  messageContent: string;
  mediaURL?: string;
  templateID?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CampaignCreate;
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.userId as string;

    const created = await prisma.whatsappCampaign.create({
       data: {
        ...body,
        userId: userId,
        status: "PAUSED", // ✅ ensure default
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) { {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = token.userId as string;

    const campaigns = await prisma.whatsappCampaign.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
}
