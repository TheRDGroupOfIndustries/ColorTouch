import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import * as ExcelJS from "exceljs";
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
        { success: false, error: "Only Excel (.xlsx) or CSV files allowed." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uploadDir = path.join(process.cwd(), "uploads");
    // await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    // await writeFile(filePath, buffer);

    console.log("✅ File uploaded:", filePath);

    // --- 3️⃣ Read Excel or CSV content ---
    const workbook = new ExcelJS.Workbook();
    let rows: LeadRow[] = [];
    
    try {
      if (file.name.endsWith(".csv")) {
        // Handle CSV files
        const csvText = Buffer.from(arrayBuffer).toString('utf-8');
        const csvRows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        
        if (csvRows.length === 0) {
          return NextResponse.json(
            { success: false, error: "CSV file is empty." },
            { status: 400 }
          );
        }

        const headers = csvRows[0].map(h => h.toLowerCase().trim());

        for (let i = 1; i < csvRows.length; i++) {
          const row = csvRows[i];
          if (row.length === 0 || row[0] === '') continue;

          const rowData: LeadRow = {};
          headers.forEach((header, index) => {
            const value = row[index]?.trim() || '';
            if (header.includes('name')) rowData.name = value;
            else if (header.includes('email')) rowData.email = value;
            else if (header.includes('phone')) rowData.phone = value;
            else if (header.includes('company')) rowData.company = value;
            else if (header.includes('source')) rowData.source = value;
            else if (header.includes('note')) rowData.notes = value;
            else if (header.includes('tag')) {
              rowData.tag = value.toUpperCase() as Tag;
            }
          });

          if (rowData.name) {
            rows.push(rowData);
          }
        }
      } else {
        // Handle Excel files
        const { Readable } = require('stream');
        const stream = Readable.from(Buffer.from(arrayBuffer));
        await workbook.xlsx.read(stream);
        
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          return NextResponse.json(
            { success: false, error: "No worksheet found in the Excel file." },
            { status: 400 }
          );
        }

        // Get headers and validate
        const headerRow = worksheet.getRow(1);
        const headers: string[] = [];
        
        headerRow.eachCell((cell, colNumber) => {
          const headerValue = String(cell.value || '').toLowerCase().trim();
          headers[colNumber] = headerValue;
        });

        // Check for required 'name' column
        const hasNameColumn = headers.some(h => h.includes('name'));
        if (!hasNameColumn) {
          return NextResponse.json(
            { success: false, error: "Excel file must have a 'name' column." },
            { status: 400 }
          );
        }

        // Process data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: LeadRow = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            const value = String(cell.value || '').trim();
            
            if (header.includes('name')) rowData.name = value;
            else if (header.includes('email')) rowData.email = value;
            else if (header.includes('phone')) rowData.phone = value;
            else if (header.includes('company')) rowData.company = value;
            else if (header.includes('source')) rowData.source = value;
            else if (header.includes('note')) rowData.notes = value;
            else if (header.includes('tag')) {
              rowData.tag = value.toUpperCase() as Tag;
            }
          });
          
          if (rowData.name) {
            rows.push(rowData);
          }
        });
      }
    } catch (fileError: any) {
      return NextResponse.json(
        { success: false, error: `Failed to read file: ${fileError.message}` },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "The file is empty." },
        { status: 400 }
      );
    }

    // --- 4️⃣ Transform rows for Prisma ---
    const leadsToInsert = rows
      .map((row) => {
        const name = String(row.name || "").trim().substring(0, 255); // Limit to 255 chars
        if (!name) return null;

        return {
          name,
          email: row.email ? String(row.email).trim().substring(0, 255) : null,
          phone: row.phone ? String(row.phone).trim().substring(0, 20) : null, // Phone max 20 chars
          company: row.company ? String(row.company).trim().substring(0, 255) : null,
          source: row.source ? String(row.source).trim().substring(0, 50) : null,
          notes: row.notes ? String(row.notes).trim().substring(0, 1000) : null, // Notes limited
          tag: row.tag || undefined,
          duration: 0,
          userId,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    // --- 4️⃣ Transform rows for Prisma and prevent duplicates ---
    const existingEmails = new Set<string>();
    
    // Get existing leads for this user to prevent duplicates
    if (leadsToInsert.some(lead => lead.email)) {
      const emails = leadsToInsert.map(lead => lead.email).filter((email): email is string => email !== null && email !== undefined);
      if (emails.length > 0) {
        const existingLeads = await prisma.lead.findMany({
          where: {
            userId,
            email: { in: emails }
          },
          select: { email: true }
        });
        
        existingLeads.forEach(lead => {
          if (lead.email) existingEmails.add(lead.email);
        });
      }
    }

    // Helper function to validate email format
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Filter out duplicates (both existing in DB and within current upload)
    const uploadEmails = new Set();
    const finalLeadsToInsert = leadsToInsert.filter((lead) => {
      // Skip if no name
      if (!lead.name) return false;
      
      // Skip if email is not in valid format
      if (lead.email && !isValidEmail(lead.email)) {
        // If email is not valid, treat it as missing but don't reject the lead
        lead.email = null;
      }
      
      // Skip if email already exists in database
      if (lead.email && existingEmails.has(lead.email)) {
        console.log(`⚠️ Skipping duplicate email: ${lead.email}`);
        return false;
      }
      
      // Skip if email already seen in this upload
      if (lead.email && uploadEmails.has(lead.email)) {
        console.log(`⚠️ Skipping duplicate email in upload: ${lead.email}`);
        return false;
      }
      
      // Add email to seen set
      if (lead.email) uploadEmails.add(lead.email);
      
      return true;
    });

    if (finalLeadsToInsert.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No new leads to import. All leads either exist already or have missing required fields.",
          duplicatesSkipped: leadsToInsert.length - finalLeadsToInsert.length
        },
        { status: 400 }
      );
    }

    // --- 5️⃣ Bulk insert using Prisma ---
    const created = await prisma.lead.createMany({
      data: finalLeadsToInsert,
      skipDuplicates: false // We handle duplicates manually above
    });

    const duplicatesSkipped = leadsToInsert.length - finalLeadsToInsert.length;
    
    console.log(`✅ Imported ${created.count} leads for user ${userId}`);
    if (duplicatesSkipped > 0) {
      console.log(`⚠️ Skipped ${duplicatesSkipped} duplicate leads`);
    }

    return NextResponse.json({
      success: true,
      imported: created.count,
      duplicatesSkipped,
      filename: fileName,
      message: `Successfully imported ${created.count} leads${duplicatesSkipped > 0 ? ` (${duplicatesSkipped} duplicates skipped)` : ''}`
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error during upload." },
      { status: 500 }
    );
  }
}
