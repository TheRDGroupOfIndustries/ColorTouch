import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // Read the sample3.csv file from the project root
    const csvPath = path.join(process.cwd(), "sample3.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    
    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="sample3.csv"',
      },
    });
  } catch (error) {
    console.error("Error serving sample CSV:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download sample CSV" },
      { status: 500 }
    );
  }
}