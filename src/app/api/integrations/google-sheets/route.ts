import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// Function to send lead to Google Sheets
export async function sendToGoogleSheets(lead: any) {
  const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK;
  
  if (!GOOGLE_SHEETS_WEBHOOK) {
    console.log("[sheets] Google Sheets webhook not configured");
    return;
  }

  try {
    // Format data for Google Sheets
    const sheetData = {
      values: [[
        lead.id,
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.amount || '',
        lead.source || '',
        lead.tag || '',
        lead.status || '',
        lead.notes || '',
        new Date(lead.createdAt).toLocaleDateString(),
        new Date(lead.createdAt).toLocaleTimeString()
      ]]
    };

    const response = await fetch(GOOGLE_SHEETS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetData)
    });

    if (response.ok) {
      console.log("[sheets] Lead sent to Google Sheets successfully");
    } else {
      console.warn("[sheets] Failed to send to Google Sheets:", response.status);
    }
  } catch (err) {
    console.error("[sheets] Error sending to Google Sheets:", err);
  }
}

// Test endpoint for Google Sheets integration
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Send test data to Google Sheets
    await sendToGoogleSheets({
      id: 'test-' + Date.now(),
      name: body.name || 'Test Lead',
      email: body.email || 'test@example.com',
      phone: body.phone || '+1234567890',
      company: body.company || 'Test Company',
      amount: body.amount || '1000',
      source: 'api-test',
      tag: 'HOT',
      status: 'PENDING',
      notes: 'Test lead from API',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Test lead sent to Google Sheets"
    });

  } catch (err: any) {
    console.error("/api/integrations/google-sheets error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || String(err) 
    }, { status: 500 });
  }
}