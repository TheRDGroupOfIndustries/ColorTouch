import { NextRequest, NextResponse } from "next/server";
import { verifyZapierSignature, handleIncomingZapierEvent } from "@/lib/zapier";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sig = req.headers.get("x-zapier-signature") || req.headers.get("x-signature");

    const ok = verifyZapierSignature(raw, sig || undefined);
    if (!ok) {
      return NextResponse.json({ success: false, error: "invalid_signature" }, { status: 401 });
    }

    const payload = JSON.parse(raw || "{}");
    const result = await handleIncomingZapierEvent(payload);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("/api/integrations/zapier/webhook error:", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
