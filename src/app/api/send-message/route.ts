import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTwilioService } from "@/lib/twilio-whatsapp";

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

    const tokenData = Array.isArray(tokens) && tokens.length > 0 ? tokens[0].token : null;

    if (!tokenData)
      return NextResponse.json({ success: false, error: "No WhatsApp token found." }, { status: 404 });

    // Parse token data to detect provider
    const istwilio = tokenData.includes(':twilio');
    const isWhatsAppBusinessAPI = tokenData.includes(':whatsapp-business-api');
    
    console.log(`🔍 Provider detected: ${istwilio ? 'Twilio' : isWhatsAppBusinessAPI ? 'WhatsApp Business API' : 'Whapi.cloud'}`);
    
    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

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
      const accessToken = parts[0];
      const phoneNumberId = parts[1];

      for (let i = 0; i < items.length; i++) {
        const lead = items[i];
        const phone = lead.phone?.toString().replace(/\D/g, "");
        if (!phone) {
          console.log(`⚠️ Skipping ${lead.name || 'Unknown'} - no valid phone number`);
          continue;
        }

        const messageText = `Hello ${lead.name || ''}, ${campaign.campaignName}: ${campaign.messageContent || ''} ${campaign.description || ''} ${campaign.mediaURL || ''}`;
        const toPhone = `+91${phone}`;
        
        console.log(`📤 Sending to ${toPhone} (${i + 1}/${items.length}) via WhatsApp Business API`);

        try {
          const messageBody = {
            messaging_product: "whatsapp",
            to: toPhone,
            type: "text",
            text: { body: messageText }
          };

          const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(messageBody),
          });

          if (response.ok) {
            sentCount++;
            console.log(`✅ Successfully sent to ${toPhone}`);
          } else {
            errorCount++;
            const error = await response.text();
            errors.push(`${phone}: ${error}`);
            console.error(`❌ Failed for ${toPhone}:`, error);
          }
        } catch (error: any) {
          errorCount++;
          errors.push(`${phone}: ${error.message}`);
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

    return NextResponse.json({ 
      success: true, 
      message: `✅ Campaign sent successfully!`, 
      sentCount,
      errorCount,
      totalLeads: items.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("❌ send-message error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
