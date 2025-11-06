import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { campaignId, status } = await req.json();

    // 🧩 1. Validate inputs
    if (!campaignId || !status) {
      return NextResponse.json(
        { success: false, error: "campaignId and status are required" },
        { status: 400 }
      );
    }

    // 🧩 2. Normalize and validate status
    const normalizedStatus = status.toString().trim().toUpperCase();
    if (!["ACTIVE", "PAUSED"].includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status value: ${status}` },
        { status: 400 }
      );
    }

    // 🧩 3. Ensure campaign exists
    const existing = await prisma.whatsappCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // 🧩 4. Update status safely
    const updated = await prisma.whatsappCampaign.update({
      where: { id: campaignId },
      data: { status: normalizedStatus },
    });

    console.log(`✅ Campaign ${campaignId} status updated to ${normalizedStatus}`);

    // 🧩 5. Return updated campaign
    return NextResponse.json({
      success: true,
      message: `Status updated to ${normalizedStatus}`,
      campaign: updated,
    });
  } catch (err: any) {
    console.error("❌ Error updating campaign status:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
