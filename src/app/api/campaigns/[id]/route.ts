import prisma from "@/lib/prisma";
import { CampaignType, MessageType, Priority } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const leads = await prisma.whatsappCampaign.findMany({
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
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const deleted = await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}