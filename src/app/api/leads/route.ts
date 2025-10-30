import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all leads
export async function GET() {
  try {
    const leads = await prisma.lead.findMany();
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// POST new lead
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, source, tag, duration, userId } = body;

    if (!name || !source || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: { name, email, phone, company, source, tag, duration, userId },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

