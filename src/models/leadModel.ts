// app/api/leads/models/leadModel.ts
import { Lead, PrismaClient, Source } from "@prisma/client";

const prisma = new PrismaClient();

//  Get all leads
export async function findAllLeads() {
  return prisma.lead.findMany();
}

//  Get leads by specific user
export async function findLeadsByUserId(userId: string) {
  return prisma.lead.findMany({ where: { userId } });
}

//  Find user by ID
export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

//  Create a new lead
export async function createLead(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: Source; 
  duration?: number;
  userId: string;
}) {
  return prisma.lead.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      source: data.source ?? "OTHER", //  default fixed
      duration: data.duration ?? 10, //  default value
      userId: data.userId,
    },
  });
}

//  Update lead details
export async function updateLead(leadId: string, data: Partial<Lead>) {
  return prisma.lead.update({
    where: { id: leadId },
    data: { ...data }, //  ensures proper type spreading
  });
}

//  Delete a lead
export async function deleteLead(leadId: string) {
  return prisma.lead.delete({
    where: { id: leadId },
  });
}
