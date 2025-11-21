import prisma from "@/lib/prisma";

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;
const ZAPIER_SIGNING_SECRET = process.env.ZAPIER_SIGNING_SECRET;

export async function sendLeadCreated(lead: any) {
  if (!ZAPIER_WEBHOOK_URL) {
    console.log("[zapier] ZAPIER_WEBHOOK_URL not configured, skipping sendLeadCreated");
    return;
  }

  try {
    const payload = {
      action: "lead.created",
      timestamp: new Date().toISOString(),
      lead,
    };

    const res = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`[zapier] webhook returned ${res.status}`);
    } else {
      console.log("[zapier] sent lead.created to Zapier");
    }
  } catch (err) {
    console.error("[zapier] sendLeadCreated error:", err);
  }
}

import crypto from "crypto";

export function verifyZapierSignature(rawBody: string, signature?: string) {
  if (!ZAPIER_SIGNING_SECRET) return true; // nothing to verify
  if (!signature) return false;
  try {
    const hmac = crypto.createHmac("sha256", ZAPIER_SIGNING_SECRET);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");
    return crypto.timingSafeEqual(Buffer.from(digest, "utf8"), Buffer.from(signature, "utf8"));
  } catch (err) {
    console.error("[zapier] signature verification error", err);
    return false;
  }
}

export async function handleIncomingZapierEvent(payload: any) {
  // Only implement basic lead.create handling for now
  try {
    if (payload?.action === "lead.create" || payload?.action === "lead.created") {
      const data = payload.lead || payload.data || payload;
      const rec = await prisma.lead.create({
        data: {
          name: data.name || data.fullName || "Zapier Lead",
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          notes: data.notes || null,
          source: data.source || "zapier",
          amount: data.amount ? String(Number(data.amount).toFixed(2)) : null,
          tag: data.tag || undefined,
          duration: data.duration ? Number(data.duration) : 0,
          // Zapier events likely won't include userId; leave null or require admin mapping
          userId: data.userId || undefined,
        },
      });
      return { success: true, created: rec };
    }

    return { success: false, error: "unsupported_event" };
  } catch (err: any) {
    console.error("[zapier] handleIncomingZapierEvent error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
