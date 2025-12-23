import prisma from "@/lib/prisma";
import { CampaignType, MessageType, Priority, User } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface CampaignCreate {
  campaignName: string;
  description?: string;
  campaignType: CampaignType;
  priority: Priority;
  messageType: MessageType;
  messageContent: string;
  mediaURL?: string;
  templateID?: string;
  selectedLeadIds?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = (await req.json()) as CampaignCreate;

    const created = await prisma.whatsappCampaign.create({
       data: {
        ...body,
        userId: userId,
        status: "PAUSED", // ✅ ensure default
        selectedLeadIds: body.selectedLeadIds ? JSON.stringify(body.selectedLeadIds) : null,
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

    let campaigns: any[] = [];
    
    try {
      campaigns = await prisma.whatsappCampaign.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      });

      // Parse selectedLeadIds from JSON string
      campaigns = campaigns.map(campaign => ({
        ...campaign,
        selectedLeadIds: campaign.selectedLeadIds ? JSON.parse(campaign.selectedLeadIds as string) : [],
      }));
    } catch (dbErr) {
      console.error("Database unavailable for campaigns — returning empty list:", dbErr);
      // Return empty array when DB is unavailable instead of crashing
      campaigns = [];
    }
    
    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error("Campaigns API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
