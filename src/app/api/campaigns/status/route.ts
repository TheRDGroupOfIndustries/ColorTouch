import { NextResponse } from "next/server";
import  prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { campaignId, status } = await req.json();

    if (!campaignId || !status) {
      return NextResponse.json(
        { success: false, error: "campaignId and status required" },
        { status: 400 }
      );
    }

    await prisma.whatsappCampaign.update({
      where: { id: campaignId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Campaign status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("Error updating campaign status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
