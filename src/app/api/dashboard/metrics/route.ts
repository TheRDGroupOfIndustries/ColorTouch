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
    
    const userId = token.userId as string;
    
    // Get date ranges for calculations
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    // 1. Get all leads for this user
    const allLeads = await prisma.lead.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        tag: true,
        source: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        duration: true
      }
    });
    
    // 2. Calculate New Leads (this week vs last week)
    const leadsThisWeek = allLeads.filter(lead => 
      new Date(lead.createdAt) >= oneWeekAgo
    ).length;
    
    const leadsLastWeek = allLeads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return createdAt >= twoWeeksAgo && createdAt < oneWeekAgo;
    }).length;
    
    const newLeadsChange = leadsLastWeek > 0 ? 
      ((leadsThisWeek - leadsLastWeek) / leadsLastWeek * 100) : 
      (leadsThisWeek > 0 ? 100 : 0);
    
    // 3. Calculate Total Revenue (based on lead values - we'll need to add this field)
    // For now, we'll use a placeholder calculation based on qualified leads
    const qualifiedLeads = allLeads.filter(lead => 
      lead.tag === 'QUALIFIED' || lead.tag === 'HOT'
    ).length;
    
    // Average deal value (placeholder - this should come from actual deal/revenue tracking)
    const avgDealValue = 2500; // ₹2,500 per qualified lead
    const totalRevenue = qualifiedLeads * avgDealValue;
    
    const qualifiedLeadsLastMonth = allLeads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      return (lead.tag === 'QUALIFIED' || lead.tag === 'HOT') && 
             createdAt >= twoMonthsAgo && createdAt < oneMonthAgo;
    }).length;
    
    const lastMonthRevenue = qualifiedLeadsLastMonth * avgDealValue;
    const revenueChange = lastMonthRevenue > 0 ? 
      ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 
      (totalRevenue > 0 ? 100 : 0);
    
    // 4. Get Active Employees count
    const activeEmployees = await prisma.user.count({
      where: {
        // Add any conditions for "active" employees
        // For now, just count all users
      }
    });
    
    const lastMonthEmployees = activeEmployees; // Placeholder for employee growth tracking
    const employeeChange = 0; // Placeholder
    
    // 5. Calculate Conversion Rate
    const totalLeads = allLeads.length;
    const convertedLeads = allLeads.filter(lead => 
      lead.tag === 'QUALIFIED' || lead.tag === 'HOT'
    ).length;
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100) : 0;
    
    // Previous month conversion rate
    const leadsLastMonth = allLeads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      return createdAt >= twoMonthsAgo && createdAt < oneMonthAgo;
    });
    
    const convertedLastMonth = leadsLastMonth.filter(lead => 
      lead.tag === 'QUALIFIED' || lead.tag === 'HOT'
    ).length;
    
    const lastMonthConversionRate = leadsLastMonth.length > 0 ? 
      (convertedLastMonth / leadsLastMonth.length * 100) : 0;
    
    const conversionRateChange = lastMonthConversionRate > 0 ? 
      ((conversionRate - lastMonthConversionRate)) : 0;
    
    // 6. Get leads breakdown by tag/status
    const leadsByTag = {
      HOT: allLeads.filter(lead => lead.tag === 'HOT').length,
      WARM: allLeads.filter(lead => lead.tag === 'WARM').length,
      COLD: allLeads.filter(lead => lead.tag === 'COLD').length,
      QUALIFIED: allLeads.filter(lead => lead.tag === 'QUALIFIED').length,
      DISQUALIFIED: allLeads.filter(lead => lead.tag === 'DISQUALIFIED').length,
    };
    
    // 7. Recent leads for follow-up (leads created in last 7 days)
    const recentLeads = allLeads
      .filter(lead => new Date(lead.createdAt) >= oneWeekAgo)
      .slice(0, 10)
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        tag: lead.tag,
        source: lead.source,
        createdAt: lead.createdAt
      }));
    
    const response = {
      success: true,
      data: {
        metrics: {
          totalRevenue: {
            value: totalRevenue,
            formatted: `₹${totalRevenue.toLocaleString('en-IN')}.00`,
            change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
            trend: revenueChange >= 0 ? 'up' : 'down',
            subtitle: revenueChange >= 0 ? 'Trending up this month' : 'Down this month'
          },
          newLeads: {
            value: leadsThisWeek,
            formatted: leadsThisWeek.toString(),
            change: `${newLeadsChange >= 0 ? '+' : ''}${newLeadsChange.toFixed(1)}%`,
            trend: newLeadsChange >= 0 ? 'up' : 'down',
            subtitle: newLeadsChange >= 0 ? 'Up this week' : 'Down this week'
          },
          activeEmployees: {
            value: activeEmployees,
            formatted: activeEmployees.toLocaleString('en-IN'),
            change: `${employeeChange >= 0 ? '+' : ''}${employeeChange.toFixed(1)}%`,
            trend: employeeChange >= 0 ? 'up' : 'down',
            subtitle: 'Total active users'
          },
          conversionRate: {
            value: conversionRate,
            formatted: `${conversionRate.toFixed(1)}%`,
            change: `${conversionRateChange >= 0 ? '+' : ''}${conversionRateChange.toFixed(1)}%`,
            trend: conversionRateChange >= 0 ? 'up' : 'down',
            subtitle: 'Lead to qualified conversion'
          }
        },
        leadsByTag,
        recentLeads,
        summary: {
          totalLeads: allLeads.length,
          qualifiedLeads,
          leadsThisWeek,
          leadsLastWeek,
          activeEmployees
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}