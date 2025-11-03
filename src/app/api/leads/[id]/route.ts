import prisma from "@/lib/prisma";
import { Tag } from "@prisma/client";
import { NextResponse } from "next/server";

interface leaduupdate {
  name: string;
  email: string;
  phone: string;
  company: string;
  tag: Tag;
  source: string;
  notes: string;
  duration: number;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const leads = await prisma.lead.findMany({
      where: { id: id },
    });

    if (!leads) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }
    const body = (await req.json()) as leaduupdate;
    const updated = await prisma.lead.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const leads = await prisma.lead.findMany({
      where: { id: id },
    });

    if (!leads) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    const deleted = await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const leads = await prisma.lead.findMany({
      where: { id: id },
    });
    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
