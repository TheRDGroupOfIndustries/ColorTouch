import prisma from "@/lib/prisma";
import { CampaignType, MessageType, Priority } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const leads = await prisma.whatsappCampaign.findUnique({
      where: { id: id },
    });

     if (!leads) {
          return NextResponse.json(
            { success: false, error: "lead not found" },
            { status: 404 }
          );
        }

    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

interface Campaignupdate {
  campaignName: string;
  description?: string;
  campaignType: CampaignType;
  priority: Priority;
  messageType: MessageType;
  messageContent: string;
  mediaURL?: string;
  templateID?: string;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const campaign = await prisma.whatsappCampaign.findMany({
      where: { id: id },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }
    const body = (await req.json()) as Campaignupdate;
    const updated = await prisma.whatsappCampaign.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // 🟢 Validate
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // 🟢 Check if campaign exists
    const existing = await prisma.whatsappCampaign.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // 🟢 Delete campaign
    const deleted = await prisma.whatsappCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
      deleted,
    });
  } catch (error: any) {
    console.error("❌ Error deleting campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
