import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { campaignId, status } = await req.json();
    if (!campaignId || !status)
      return NextResponse.json(
        { error: "campaignId and status required" },
        { status: 400 }
      );

    const updated = await prisma.whatsappCampaign.update({
      where: { id: campaignId },
      data: { status: status.toUpperCase() },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
