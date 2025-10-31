// app/api/leads/controllers/leadController.ts
import { NextResponse } from "next/server";
import {
  findAllLeads,
  findLeadsByUserId,
  findUserById,
  createLead,
  updateLead,
  deleteLead
} from "../models/leadModel";

export async function getLeadsController(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    const leads = userId ? await findLeadsByUserId(userId) : await findAllLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function createLeadController(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, source, userId } = body;

    if (!name || !source || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newLead = await createLead({ name, email, phone, company, source, userId });
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function updateLeadController(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const body = await req.json();
    const allowed = (({ name, email, phone, company, source, duration }) => ({ name, email, phone, company, source, duration }))(body);

    const updated = await updateLead(leadId, allowed);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function deleteLeadController(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    await deleteLead(leadId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
