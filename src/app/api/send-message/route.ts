// app/api/combined/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse body — get campaignId from frontend
    const { campaignId } = await req.json();
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "campaignId is required" },
        { status: 400 }
      );
    }

    // 2️⃣ Authenticate user
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

    // 3️⃣ Fetch data from internal APIs
    const [leadRes, tokenRes, campaignRes] = await Promise.all([
      fetch(`${baseURL}/api/leads`, {
        headers: { Cookie: req.headers.get("cookie") || "" }, // keep auth
      }),
      fetch(`${baseURL}/api/token`, {
        headers: { Cookie: req.headers.get("cookie") || "" },
      }),
      fetch(`${baseURL}/api/campaigns/${campaignId}`, {
        headers: { Cookie: req.headers.get("cookie") || "" },
      }),
    ]);

    const [leads, tokens, campaigns] = await Promise.all([
      leadRes.json(),
      tokenRes.json(),
      campaignRes.json(),
    ]);

    // 4️⃣ Extract data
    const items = Array.isArray(leads) ? leads : [];
    const token = Array.isArray(tokens) && tokens.length > 0 ? tokens[0].token : null;
    const campaign = Array.isArray(campaigns) && campaigns.length > 0 ? campaigns[0] : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No WhatsApp token found for this user." },
        { status: 404 }
      );
    }

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    // 5️⃣ Prepare message sending
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (let i = 0; i < items.length; i++) {
      const lead = items[i];

      const messageBody = {
        to: lead.phone, // assumes phone number is in lead.phone
        body: `${lead.name}, ${campaign.campaignName}: ${campaign.messageContent}`,
      };

      console.log(`Sending to ${lead.phone} (${i + 1}/${items.length})`);

      const response = await fetch("https://panel.whapi.cloud/messages/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageBody),
      });

      const result = await response.json();
      console.log("Result:", result);

      if (i < items.length - 1) {
        await delay(12000);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent messages to ${items.length} leads.`,
    });
  } catch (error: any) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
