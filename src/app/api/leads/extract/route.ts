import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const csvData = buffer.toString();

    const records: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      duration?: string | number;
      userId: string;
    }[] = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Create leads
    for (const record of records) {
      await prisma.lead.create({
        data: {
          name: record.name,
          email: record.email ?? null,
          phone: record.phone ?? null,
          company: record.company ?? null,
          source:
            record.source &&
            ["SOCIAL", "REFERRAL", "EVENT", "MARKETING", "OTHER"].includes(record.source.toUpperCase())
              ? (record.source.toUpperCase() as any)
              : "OTHER",
          duration: Number(record.duration) || 10,
          userId: record.userId,
        },
      });
    }

    return NextResponse.json({ message: "Leads extracted successfully!" });
  } catch (error) {
    console.error("Error extracting leads:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
