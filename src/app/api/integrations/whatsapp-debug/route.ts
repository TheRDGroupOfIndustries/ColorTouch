import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

function parseStoredWhatsAppBusinessToken(tokenData: string | null | undefined) {
  if (!tokenData) return null;
  if (!tokenData.includes(":whatsapp-business-api")) return null;
  const parts = tokenData.split(":");
  if (parts.length < 3) return null;
  return {
    accessToken: (parts[0] || "").trim(),
    phoneNumberId: (parts[1] || "").trim(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      accessToken?: string;
      phoneNumberId?: string;
    };

    // Prefer provided creds (from Integrations UI), else use stored token, else use env
    let accessToken = body.accessToken?.trim();
    let phoneNumberId = body.phoneNumberId?.trim();

    if (!accessToken || !phoneNumberId) {
      const saved = await prisma.whatsappToken.findFirst({ where: { userId: user.id as string } });
      const parsed = parseStoredWhatsAppBusinessToken(saved?.token ?? null);
      if (!accessToken) accessToken = parsed?.accessToken ?? process.env.WHATSAPP_ACCESS_TOKEN;
      if (!phoneNumberId) phoneNumberId = parsed?.phoneNumberId ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
    }

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "Missing WhatsApp accessToken/phoneNumberId" },
        { status: 400 }
      );
    }

    const graphVersion = (process.env.WHATSAPP_GRAPH_VERSION || "v22.0").trim();

    // 1) Check token is valid
    const meRes = await fetch(`https://graph.facebook.com/${graphVersion}/me?fields=id,name`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const meJson = await meRes.json();

    // 2) Check the phone number object is accessible with this token
    const pnRes = await fetch(
      `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const pnJson = await pnRes.json();

    const ok = meRes.ok && pnRes.ok;

    return NextResponse.json({
      success: ok,
      details: {
        tokenCheck: {
          ok: meRes.ok,
          status: meRes.status,
          data: meRes.ok ? meJson : undefined,
          error: !meRes.ok ? meJson : undefined,
        },
        phoneNumberCheck: {
          ok: pnRes.ok,
          status: pnRes.status,
          data: pnRes.ok ? pnJson : undefined,
          error: !pnRes.ok ? pnJson : undefined,
          phoneNumberId,
        },
      },
    }, { status: ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
