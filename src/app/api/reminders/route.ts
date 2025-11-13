import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Create a new reminder
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = token.userId as string;
    const body = await req.json();
    
    const { leadId, title, description, reminderDate, reminderType, priority } = body;
    
    // Validate required fields
    if (!title || !reminderDate) {
      return NextResponse.json(
        { success: false, error: "Title and reminder date are required" },
        { status: 400 }
      );
    }
    
    // Create the reminder
    const reminder = await prisma.reminder.create({
      data: {
        title,
        description: description || null,
        reminderDate: new Date(reminderDate),
        reminderType: reminderType || 'GENERAL',
        priority: priority || 'MEDIUM',
        isCompleted: false,
        userId,
        leadId: leadId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      reminder,
      message: "Reminder created successfully"
    });
    
  } catch (error: any) {
    console.error("Create reminder error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create reminder" },
      { status: 500 }
    );
  }
}

// Get reminders for the user
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = token.userId as string;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'pending', 'completed', 'overdue', 'all'
    const timeframe = searchParams.get('timeframe'); // 'today', 'week', 'month', 'all'
    
    // Build where conditions
    let whereConditions: any = { userId };
    
    // Filter by completion status
    if (status === 'pending') {
      whereConditions.isCompleted = false;
    } else if (status === 'completed') {
      whereConditions.isCompleted = true;
    } else if (status === 'overdue') {
      whereConditions.isCompleted = false;
      whereConditions.reminderDate = {
        lt: new Date()
      };
    }
    
    // Filter by timeframe
    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          whereConditions.reminderDate = {
            gte: startDate,
            lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0, 0, 0, 0);
          whereConditions.reminderDate = {
            gte: startDate,
            lt: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          };
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          whereConditions.reminderDate = {
            gte: startDate,
            lt: endDate
          };
          break;
      }
    }
    
    const reminders = await prisma.reminder.findMany({
      where: whereConditions,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            tag: true
          }
        }
      },
      orderBy: [
        { isCompleted: 'asc' },
        { reminderDate: 'asc' },
        { priority: 'desc' }
      ]
    });
    
    // Group reminders by urgency
    const now = new Date();
    const today = new Date(now.setHours(23, 59, 59, 999));
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    type ReminderType = typeof reminders[0];
    const groupedReminders = {
      overdue: reminders.filter((r: ReminderType) => !r.isCompleted && new Date(r.reminderDate) < new Date()),
      today: reminders.filter((r: ReminderType) => 
        !r.isCompleted && 
        new Date(r.reminderDate) >= new Date() && 
        new Date(r.reminderDate) <= today
      ),
      tomorrow: reminders.filter((r: ReminderType) => 
        !r.isCompleted && 
        new Date(r.reminderDate) > today && 
        new Date(r.reminderDate) <= tomorrow
      ),
      thisWeek: reminders.filter((r: ReminderType) => 
        !r.isCompleted && 
        new Date(r.reminderDate) > tomorrow && 
        new Date(r.reminderDate) <= thisWeek
      ),
      later: reminders.filter((r: ReminderType) => 
        !r.isCompleted && 
        new Date(r.reminderDate) > thisWeek
      ),
      completed: reminders.filter((r: ReminderType) => r.isCompleted)
    };
    
    // Get summary stats
    const stats = {
      total: reminders.length,
      pending: reminders.filter((r: ReminderType) => !r.isCompleted).length,
      overdue: groupedReminders.overdue.length,
      today: groupedReminders.today.length,
      thisWeek: groupedReminders.thisWeek.length,
      completed: groupedReminders.completed.length
    };
    
    return NextResponse.json({
      success: true,
      reminders,
      groupedReminders,
      stats
    });
    
  } catch (error: any) {
    console.error("Get reminders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}