import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only admins can view employees
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
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
    // If the error is a Prisma connection issue, return a safe empty payload so the admin UI
    // can display a friendly message instead of the server throwing a 500.
    const msg = (error && error.message) ? String(error.message) : "Failed to fetch employees";
    if (msg.includes("Can't reach database server") || msg.includes('PrismaClientInitializationError')) {
      return NextResponse.json({
        success: true,
        employees: [],
        stats: {
          total: 0,
          admins: 0,
          employees: 0,
          premium: 0,
          free: 0,
          recentlyActive: 0,
          activePercentage: 0
        },
        warning: 'Database unreachable. Showing empty results.'
      });
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch employees" },
      { status: 500 }
    );
  }
}