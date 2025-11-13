import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get all employees (users)
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            leads: true,
            campaigns: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate stats
    const stats = {
      total: employees.length,
      admins: employees.filter(emp => emp.role === 'ADMIN').length,
      employees: employees.filter(emp => emp.role === 'EMPLOYEE').length,
      premium: employees.filter(emp => emp.subscription === 'PREMIUM').length,
      free: employees.filter(emp => emp.subscription === 'FREE').length,
    };
    
    // Calculate activity metrics
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentlyActive = employees.filter(emp => 
      new Date(emp.updatedAt) >= oneMonthAgo
    ).length;
    
    return NextResponse.json({
      success: true,
      employees,
      stats: {
        ...stats,
        recentlyActive,
        activePercentage: employees.length > 0 ? 
          (recentlyActive / employees.length * 100).toFixed(1) : 0
      }
    });
    
  } catch (error: any) {
    console.error("Employees API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch employees" },
      { status: 500 }
    );
  }
}