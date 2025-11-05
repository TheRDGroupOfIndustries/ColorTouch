import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();
    if (!campaignId)
      return NextResponse.json({ success: false, error: "campaignId required" }, { status: 400 });

    const session = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!session?.userId)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const host = (await headers()).get("host");
    const baseURL = `${process.env.NODE_ENV === "development" ? "http" : "https"}://${host}`;

    const [leadRes, tokenRes, campaignRes] = await Promise.all([
      fetch(`${baseURL}/api/leads`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
      fetch(`${baseURL}/api/token`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
      fetch(`${baseURL}/api/campaigns/${campaignId}`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
    ]);

    const [leads, tokens, campaign] = await Promise.all([
      leadRes.json(),
      tokenRes.json(),
      campaignRes.json(),
    ]);

    const items = Array.isArray(leads) ? leads : [];
    const token = Array.isArray(tokens) && tokens.length > 0 ? tokens[0].token : null;

    if (!token)
      return NextResponse.json({ success: false, error: "No WhatsApp token found." }, { status: 404 });

    if (!campaign)
      return NextResponse.json({ success: false, error: "Campaign not found." }, { status: 404 });

    if (campaign.status !== "ACTIVE") {
      console.log("⏸️ Campaign paused. Skipping send.");
      return NextResponse.json({
        success: false,
        message: "Campaign is paused. Activate it to send messages.",
      });
    }

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (let i = 0; i < items.length; i++) {
      const lead = items[i];
      const phone = lead.phone?.toString().replace(/\D/g, "");
      if (!phone) continue;

      const messageBody = {
        to: phone,
        body: `${lead.name}, ${campaign.campaignName}: ${campaign.messageContent}`,
      };

      console.log(`📤 Sending to ${phone} (${i + 1}/${items.length})`);

      const response = await fetch("https://gate.whapi.cloud/messages/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageBody),
      });

      const text = await response.text();
      console.log("Response Status:", response.status);
      console.log("Response Body:", text);

      if (!response.ok) {
        console.error(`❌ Failed for ${phone}`);
        continue;
      }

      await delay(12000);
    }

    return NextResponse.json({ success: true, message: "✅ Messages sent successfully." });
  } catch (error: any) {
    console.error("❌ send-message error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
