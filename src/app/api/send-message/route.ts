import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "campaignId is required" },
        { status: 400 }
      );
    }

    // ✅ Authenticate
    const session = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseURL = `${protocol}://${host}`;

    // ✅ Fetch campaign, leads, token
    const [leadRes, tokenRes, campaignRes] = await Promise.all([
      fetch(`${baseURL}/api/leads`, {
        headers: { Cookie: req.headers.get("cookie") || "" },
      }),
      fetch(`${baseURL}/api/token`, {
        headers: { Cookie: req.headers.get("cookie") || "" },
      }),
      fetch(`${baseURL}/api/campaigns/${campaignId}`, {
        headers: { Cookie: req.headers.get("cookie") || "" },
      }),
    ]);

    const [leads, tokens, campaign] = await Promise.all([
      leadRes.json(),
      tokenRes.json(),
      campaignRes.json(),
    ]);

    const items = Array.isArray(leads) ? leads : [];
    const token =
      Array.isArray(tokens) && tokens.length > 0 ? tokens[0].token : null;

    if (!token)
      return NextResponse.json(
        { success: false, error: "No WhatsApp token found." },
        { status: 404 }
      );

    if (!campaign)
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );

    if (campaign.status !== "Active") {
      console.log("⏸️ Campaign is paused, skipping message sending.");
      return NextResponse.json({
        success: false,
        message: "Campaign is paused. Activate it to start sending.",
      });
    }

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (let i = 0; i < items.length; i++) {
      // 🔁 Check if paused before sending next message
      const checkRes = await fetch(`${baseURL}/api/campaigns/${campaignId}`, {
        headers: { Cookie: req.headers.get("cookie") || "" },
      });
      const currentCampaign = await checkRes.json();

      if (currentCampaign.status !== "Active") {
        console.log("⏸️ Campaign paused. Stopping message sending.");
        break;
      }

      const lead = items[i];
      const messageBody = {
        to: lead.phone,
        body: `${lead.name}, ${campaign.campaignName}: ${campaign.messageContent}`,
      };

      console.log(`📤 Sending to ${lead.phone} (${i + 1}/${items.length})`);

      const response = await fetch("https://panel.whapi.cloud/messages/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageBody),
      });

      const resultText = await response.text();
      let result: any;
      try {
        result = JSON.parse(resultText);
      } catch {
        console.error("⚠️ Non-JSON response:", resultText);
        result = { error: "Invalid JSON", raw: resultText };
      }

      console.log("✅ API result:", result);

      if (!response.ok) {
        console.error(`❌ Failed for ${lead.phone}:`, result.error);
      }

      if (i < items.length - 1) await delay(12000);
    }

    return NextResponse.json({
      success: true,
      message: `✅ Messages sent (or stopped if paused).`,
    });
  } catch (error: any) {
    console.error("❌ Error in send-message route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
