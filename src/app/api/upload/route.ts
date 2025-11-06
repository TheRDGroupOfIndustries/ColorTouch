import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { PrismaClient, Tag } from "@prisma/client";
import jwt from "jsonwebtoken";
import { verifyJwt } from "@/lib/jwt";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
export const runtime = "nodejs";

// Define type for Excel rows
type LeadRow = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  tag?: Tag;
};

export async function POST(req: NextRequest) {
  try {
    // --- 1️⃣ Extract userId from cookies ---
    // const cookieStore = cookies();
    // const token =
    //   (await cookieStore).get('next-auth.session-token')?.value ||
    //   (await cookieStore).get('token')?.value;

    // if (!token) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized: No session found.' },
    //     { status: 401 }
    //   );
    // }

    // const decoded: any = await verifyJwt(token);
    // const userId = decoded?.id;
    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid user session.' },
    //     { status: 403 }
    //   );
    // }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.userId as string;

    // --- 2️⃣ Handle file upload ---
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { success: false, error: "Only Excel or CSV files allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");
    // await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    // await writeFile(filePath, buffer);

    console.log("✅ File uploaded:", filePath);

    // --- 3️⃣ Read Excel or CSV content ---
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<LeadRow>(sheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "The file is empty." },
        { status: 400 }
      );
    }

    // --- 4️⃣ Transform rows for Prisma ---
    const leadsToInsert = rows
      .map((row) => {
        const name = String(row.name || "").trim();
        if (!name) return null;

        return {
          name,
          email: row.email ? String(row.email).trim() : null,
          phone: row.phone ? String(row.phone).trim() : null,
          company: row.company ? String(row.company).trim() : null,
          source: row.source ? String(row.source).trim() : null,
          notes: row.notes ? String(row.notes).trim() : null,
          tag: row.tag || undefined,
          duration: 0,
          userId,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (leadsToInsert.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid rows found to import." },
        { status: 400 }
      );
    }

    // --- 5️⃣ Bulk insert using Prisma ---
    const created = await prisma.lead.createMany({
      data: leadsToInsert,
      skipDuplicates: true, // avoids conflict if email is unique
    });

    console.log(`✅ Imported ${created.count} leads for user ${userId}`);

    return NextResponse.json({
      success: true,
      imported: created.count,
      filename: fileName,
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error during upload." },
      { status: 500 }
    );
  }
}
