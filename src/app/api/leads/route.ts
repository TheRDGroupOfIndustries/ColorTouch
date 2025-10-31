// src/app/api/leads/route.ts
import { getLeadsController, createLeadController } from "@/controller/leadController";

// Handle GET request — fetch all leads or user-specific leads
export async function GET(req: Request) {
  return getLeadsController(req);
}

// Handle POST request — create a new lead
export async function POST(req: Request) {
  return createLeadController(req);
}
