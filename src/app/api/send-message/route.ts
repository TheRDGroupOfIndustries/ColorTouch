import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTwilioService } from "@/lib/twilio-whatsapp";

function normalizeWhatsappToNumber(rawPhone: unknown, defaultCountryCode: string) {
  const digits = String(rawPhone ?? "").replace(/\D/g, "");
  if (!digits) return null;

  // Common user inputs: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
  let normalized = digits;
  if (normalized.startsWith("00")) normalized = normalized.slice(2);
  if (normalized.startsWith("0") && normalized.length >= 11) normalized = normalized.slice(1);

  // If it looks like a national number (10 digits), apply default CC (India = 91)
  if (normalized.length === 10) {
    return `${defaultCountryCode}${normalized}`;
  }

  // Otherwise assume user already provided full international number (no +)
  if (normalized.length >= 11 && normalized.length <= 15) {
    return normalized;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();
    if (!campaignId)
      return NextResponse.json({ success: false, error: "campaignId required" }, { status: 400 });

    // ✅ Auth check
    const session = await auth();
    if (!session || !session.user?.id)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // ✅ Directly fetch campaign from DB
    const campaign = await prisma.whatsappCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign)
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });

    // Parse selectedLeadIds from campaign
    const selectedLeadIds = campaign.selectedLeadIds 
      ? JSON.parse(campaign.selectedLeadIds as string) 
      : [];

    // ✅ Normalize status check
    const campaignStatus = campaign.status?.toString().trim().toUpperCase();
    if (campaignStatus !== "ACTIVE") {
      console.log("⏸️ Campaign paused. Skipping send.");
      return NextResponse.json({
        success: false,
        message: `Campaign is paused (${campaignStatus}). Activate it to send messages.`,
      });
    }

    // ✅ Fetch leads & token
    const host = (await headers()).get("host");
    const baseURL = `${process.env.NODE_ENV === "development" ? "http" : "https"}://${host}`;

    const [leadRes, tokenRes] = await Promise.all([
      fetch(`${baseURL}/api/leads`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
      fetch(`${baseURL}/api/token`, { headers: { Cookie: req.headers.get("cookie") || "" } }),
    ]);

    const [leads, tokens] = await Promise.all([leadRes.json(), tokenRes.json()]);
    const allLeads = Array.isArray(leads) ? leads : [];
    
    // Filter leads based on selectedLeadIds
    const items = selectedLeadIds.length > 0 
      ? allLeads.filter(lead => selectedLeadIds.includes(lead.id))
      : allLeads;

    console.log(`📊 Total leads: ${allLeads.length}, Selected leads: ${items.length}`);

    if (items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No leads selected for this campaign. Please select leads first." 
      }, { status: 400 });
    }

    let tokenData = Array.isArray(tokens) && tokens.length > 0 ? tokens[0].token : null;

    // Fallback to server env if user hasn't saved token yet
    if (!tokenData && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      tokenData = `${process.env.WHATSAPP_ACCESS_TOKEN}:${process.env.WHATSAPP_PHONE_NUMBER_ID}:whatsapp-business-api`;
    }

    if (!tokenData)
      return NextResponse.json({ success: false, error: "No WhatsApp token found." }, { status: 404 });

    // Parse token data to detect provider
    const istwilio = tokenData.includes(':twilio');
    const isWhatsAppBusinessAPI = tokenData.includes(':whatsapp-business-api');
    
    console.log(`🔍 Provider detected: ${istwilio ? 'Twilio' : isWhatsAppBusinessAPI ? 'WhatsApp Business API' : 'Whapi.cloud'}`);
    
    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const acceptedMessageIds: string[] = [];

    // Use Twilio service if available
    if (istwilio) {
      const twilioService = createTwilioService(tokenData);
      if (!twilioService) {
        return NextResponse.json({ success: false, error: "Invalid Twilio configuration" }, { status: 400 });
      }

      for (let i = 0; i < items.length; i++) {
        const lead = items[i];
        const phone = lead.phone?.toString().replace(/\D/g, "");
        if (!phone) {
          console.log(`⚠️ Skipping ${lead.name || 'Unknown'} - no valid phone number`);
          continue;
        }

        const messageText = `Hello ${lead.name || ''}, ${campaign.campaignName}: ${campaign.messageContent || ''} ${campaign.description || ''} ${campaign.mediaURL || ''}`;
        
        // Add country code if not present (check if starts with country code)
        const fullPhone = phone.startsWith('91') || phone.length > 10 
          ? `+${phone}` 
          : `+91${phone}`;
        
        console.log(`📤 Sending to ${phone} (formatted: ${fullPhone}) (${i + 1}/${items.length}) via Twilio`);

        const result = await twilioService.sendMessage({
          to: fullPhone,
          body: messageText,
          mediaUrl: campaign.mediaURL || undefined,
        });

        if (result.success) {
          sentCount++;
          console.log(`✅ Successfully sent to ${phone} (Message ID: ${result.messageId})`);
        } else {
          errorCount++;
          errors.push(`${phone}: ${result.error}`);
          console.error(`❌ Failed for ${phone}: ${result.error}`);
        }

        // Rate limiting delay
        if (i < items.length - 1) {
          await new Promise(res => setTimeout(res, 1000)); // 1 second delay
        }
      }
    } else if (isWhatsAppBusinessAPI) {
      const parts = tokenData.split(':');
      const accessToken = (parts[0] || "").trim();
      const phoneNumberId = (parts[1] || "").trim();

      if (!accessToken || !phoneNumberId) {
        return NextResponse.json(
          { success: false, error: "Invalid WhatsApp Business API credentials (missing token or phoneNumberId)" },
          { status: 400 }
        );
      }

      const defaultCountryCode = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91").replace(/\D/g, "") || "91";
      const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "hello_world";
      const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
      const graphVersion = (process.env.WHATSAPP_GRAPH_VERSION || "v22.0").trim();

      for (let i = 0; i < items.length; i++) {
        const lead = items[i];

        const toPhone = normalizeWhatsappToNumber(lead.phone, defaultCountryCode);
        if (!toPhone) {
          console.log(`⚠️ Skipping ${lead.name || 'Unknown'} - no valid phone number`);
          continue;
        }

        console.log(`📤 Sending to ${toPhone} (${i + 1}/${items.length}) via WhatsApp Business API`);

        try {
          // WhatsApp Cloud API: template required for first contact (outside 24-hour window)
          // Free-form text messages only work if user has messaged you in last 24 hours
          const messageBody = {
            messaging_product: "whatsapp",
            to: toPhone,
            type: "template",
            template: {
              name: templateName,
              language: { code: templateLanguage }
            }
          };

          console.log(`📝 Using template message (${templateName}) - WhatsApp requires templates for first contact`);

          const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(messageBody),
          });

          const responseData = await response.json();
          
          if (response.ok) {
            sentCount++;
            const messageId = responseData?.messages?.[0]?.id;
            if (typeof messageId === "string" && messageId.length > 0) {
              acceptedMessageIds.push(messageId);
            }
            console.log(`✅ Accepted by WhatsApp for ${toPhone}`, responseData);
          } else {
            errorCount++;
            const errorMsg = responseData.error?.message || JSON.stringify(responseData);
            errors.push(`${toPhone}: ${errorMsg}`);
            console.error(`❌ Failed for ${toPhone}:`, responseData);
          }
        } catch (error: any) {
          errorCount++;
          errors.push(`${toPhone}: ${error.message}`);
          console.error(`❌ Error sending to ${toPhone}:`, error);
        }

        // Rate limiting
        if (i < items.length - 1) {
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    } else {
      // Whapi.cloud API
      const apiToken = tokenData;

      for (let i = 0; i < items.length; i++) {
        const lead = items[i];
        const phone = lead.phone?.toString().replace(/\D/g, "");
        if (!phone) {
          console.log(`⚠️ Skipping ${lead.name || 'Unknown'} - no valid phone number`);
          continue;
        }

        const messageText = `Hello ${lead.name || ''}, ${campaign.campaignName}: ${campaign.messageContent || ''} ${campaign.description || ''} ${campaign.mediaURL || ''}`;
        
        console.log(`📤 Sending to ${phone} (${i + 1}/${items.length}) via Whapi.cloud`);

        try {
          const messageBody = {
            to: `91${phone}`,
            body: messageText,
          };

          const response = await fetch("https://gate.whapi.cloud/messages/text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(messageBody),
          });

          if (response.ok) {
            sentCount++;
            console.log(`✅ Successfully sent to ${phone}`);
          } else {
            errorCount++;
            const error = await response.text();
            errors.push(`${phone}: ${error}`);
            console.error(`❌ Failed for ${phone}:`, error);
          }
        } catch (error: any) {
          errorCount++;
          errors.push(`${phone}: ${error.message}`);
          console.error(`❌ Error sending to ${phone}:`, error);
        }

        // Rate limiting
        if (i < items.length - 1) {
          await new Promise(res => setTimeout(res, 12000)); // 12 seconds for Whapi
        }
      }
    }

    const totalLeads = items.length;
    const partial = sentCount > 0 && errorCount > 0;
    const success = sentCount > 0 && errorCount === 0;

    const message = success
      ? `✅ Campaign sent successfully!`
      : partial
        ? `⚠️ Campaign partially sent: ${sentCount}/${totalLeads} accepted, ${errorCount} failed.`
        : `❌ Campaign failed: 0/${totalLeads} accepted.`;

    const payload = {
      success,
      partial,
      message,
      sentCount,
      errorCount,
      totalLeads,
      errors: errors.length > 0 ? errors : undefined,
      acceptedMessageIds: acceptedMessageIds.length > 0 ? acceptedMessageIds : undefined,
    };

    // If nothing was accepted, return a non-2xx so UI can treat it as failure
    if (!success && !partial) {
      return NextResponse.json(payload, { status: 400 });
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("❌ send-message error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
