import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();
    if (!campaignId)
      return NextResponse.json({ success: false, error: "campaignId required" }, { status: 400 });

    // ✅ Auth check
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!session?.userId)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // ✅ Directly fetch campaign from DB (no nested API fetch)
    const campaign = await prisma.whatsappCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign)
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });

    // ✅ Normalize status check (real enum from DB)
    const campaignStatus = campaign.status?.toString().trim().toUpperCase();
    if (campaignStatus !== "ACTIVE") {
      console.log("⏸️ Campaign paused. Skipping send.");
      return NextResponse.json({
        success: false,
        message: `Campaign is paused (${campaignStatus}). Activate it to send messages.`,
      });
    }

    // ✅ Fetch leads & token via API routes
    const host = (await headers()).get("host");
    const baseURL = `${process.env.NODE_ENV === "development" ? "http" : "https"}://${host}`;

    const [leadRes, tokenRes] = await Promise.all([
      fetch(`${baseURL}/api/leads`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
      fetch(`${baseURL}/api/token`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
    ]);

    const [leads, tokens] = await Promise.all([leadRes.json(), tokenRes.json()]);
    const items = Array.isArray(leads) ? leads : [];
    const tokenData = Array.isArray(tokens) && tokens.length > 0 ? tokens[0].token : null;

    if (!tokenData)
      return NextResponse.json({ success: false, error: "No WhatsApp token found." }, { status: 404 });

    // Parse token data to detect provider
    const istwilio = tokenData.includes(':twilio');
    const isWhatsAppBusinessAPI = tokenData.includes(':whatsapp-business-api');
    let accountSid = '', authToken = '', phoneNumber = '', apiToken = '', accessToken = '', phoneNumberId = '';
    
    console.log(`🔍 Debug: tokenData="${tokenData.substring(0, 50)}..." istwilio=${istwilio} isWhatsAppBusinessAPI=${isWhatsAppBusinessAPI}`);
    
    if (istwilio) {
      const parts = tokenData.split(':');
      accountSid = parts[0];
      authToken = parts[1];
      phoneNumber = parts[2] || '';
      console.log(`🔍 Debug: parsed phoneNumber="${phoneNumber}"`);
    } else if (isWhatsAppBusinessAPI) {
      const parts = tokenData.split(':');
      accessToken = parts[0];
      phoneNumberId = parts[1];
      console.log(`🔍 Debug: parsed accessToken="${accessToken.substring(0, 20)}..." phoneNumberId="${phoneNumberId}"`);
    } else {
      apiToken = tokenData;
    }

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    let sentCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i++) {
      const lead = items[i];
      const phone = lead.phone?.toString().replace(/\D/g, "");
      if (!phone) {
        console.log(`⚠️ Skipping ${lead.name || 'Unknown'} - no valid phone number`);
        continue;
      }

      const messageText = `Hello ${lead.name || ''}, ${campaign.campaignName}: ${campaign.messageContent || ''} ${campaign.description || ''} ${campaign.mediaURL || ''}`;
      
      console.log(`📤 Sending to ${phone} (${i + 1}/${items.length})`);

      let response;
      
      try {
        if (istwilio) {
          // Twilio WhatsApp API - aggressive sanitization for Unicode chars
          const rawPhone = phoneNumber || '+14155238886';
          console.log(`🔍 Debug: raw phoneNumber="${JSON.stringify(rawPhone)}"`);
          
          // Strip all Unicode control chars, spaces, and normalize
          const cleanPhone = rawPhone
            .replace(/[\u200B-\u200D\u202A-\u202E\u2060-\u206F]/g, '') // Remove Unicode formatting
            .replace(/\s+/g, '') // Remove all whitespace
            .replace(/^whatsapp:/i, '') // Remove whatsapp: prefix
            .replace(/[^\d+]/g, ''); // Keep only digits and +
          
          const fromNumber = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
          
          console.log(`🔍 Debug: cleaned fromNumber="${fromNumber}"`);
          console.log(`🔍 Debug: accountSid="${accountSid.substring(0, 10)}..."`);

          const twilioBody = new URLSearchParams({
            From: `whatsapp:${fromNumber}`,
            To: `whatsapp:+91${phone}`,
            Body: messageText
          });

          response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            },
            body: twilioBody,
          });
        } else if (isWhatsAppBusinessAPI) {
          // WhatsApp Business API
          const toPhone = phone.startsWith('91') ? phone : `91${phone}`;
          
          console.log(`🔍 WhatsApp Business API: phoneNumberId="${phoneNumberId}" to="${toPhone}"`);
          
          const messageBody = {
            messaging_product: "whatsapp",
            to: toPhone,
            type: "text",
            text: {
              body: messageText
            }
          };

          response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(messageBody),
          });
        } else {
          // Original Whapi.cloud API
          const messageBody = {
            to: `91${phone}`,
            body: messageText,
          };

          response = await fetch("https://gate.whapi.cloud/messages/text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(messageBody),
          });
        }

        const text = await response.text();
        console.log("Response Status:", response.status);
        console.log("Response Body:", text);

        if (!response.ok) {
          console.error(`❌ Failed for ${phone}`);
          errorCount++;
          continue;
        }

        sentCount++;
        console.log(`✅ Successfully sent to ${phone}`);

        await delay(12000);
      } catch (error) {
        console.error(`❌ Error sending to ${phone}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `✅ Campaign sent successfully!`, 
      sentCount,
      errorCount,
      totalLeads: items.length
    });
  } catch (error: any) {
    console.error("❌ send-message error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
