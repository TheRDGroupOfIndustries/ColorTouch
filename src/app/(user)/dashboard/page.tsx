"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  UserPlus,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import AddReminderModal from "@/components/AddReminderModal";
import LeadsAddModal from "@/components/LeadsAddModal";

interface DashboardMetrics {
  totalRevenue: {
    value: number;
    formatted: string;
    change: string;
    trend: "up" | "down";
    subtitle: string;
  };
  newLeads: {
    value: number;
    formatted: string;
    change: string;
    trend: "up" | "down";
    subtitle: string;
  };
  activeEmployees: {
    value: number;
    formatted: string;
    change: string;
    trend: "up" | "down";
    subtitle: string;
  };
  conversionRate: {
    value: number;
    formatted: string;
    change: string;
    trend: "up" | "down";
    subtitle: string;
  };
}

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  tag: string;
  source?: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderDate: string;
  reminderType: string;
  priority: string;
  isCompleted: boolean;
  lead?: {
    id: string;
    name: string;
    company?: string;
  };
}

interface GroupedReminders {
  overdue: Reminder[];
  today: Reminder[];
  tomorrow: Reminder[];
  thisWeek: Reminder[];
  later: Reminder[];
  completed: Reminder[];
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // If employee and not premium, redirect to payments
  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const user = session?.user as any;
        if (!user || !user.id) return;
        if (user.role !== "EMPLOYEE") return;

        const res = await fetch(`/api/auth/user/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const subscription = data.subscription as string | undefined;
        if (subscription !== "PREMIUM") {
          router.replace("/payments");
        }
      } catch (err) {
        console.error("Failed to check subscription for redirect:", err);
      }
    };

    checkAndRedirect();
  }, [session, router]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [reminders, setReminders] = useState<GroupedReminders | null>(null);
  const [reminderStats, setReminderStats] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard metrics
      const metricsRes = await fetch("/api/dashboard/metrics", {
        credentials: "same-origin",
      });

      if (!metricsRes.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const metricsData = await metricsRes.json();

      if (metricsData.success) {
        const apiMetrics = metricsData.data?.metrics;
        const apiRecent = metricsData.data?.recentLeads || [];

        // Guard against unexpected API responses
        if (!apiMetrics) {
          console.warn("Dashboard metrics API returned no metrics");
          setMetrics(null);
        } else {
          setMetrics(apiMetrics);
        }

        setRecentLeads(Array.isArray(apiRecent) ? apiRecent : []);
      } else {
        // If the API returns success: false, show a toast and set friendly defaults
        console.warn("Dashboard metrics API reported failure", metricsData.error);
        setMetrics(null);
        setRecentLeads([]);
      }

      // Fetch reminders
      const remindersRes = await fetch("/api/reminders", {
        credentials: "same-origin",
      });

      if (remindersRes.ok) {
        const remindersData = await remindersRes.json();
        if (remindersData.success) {
          setReminders(remindersData.groupedReminders);
          setReminderStats(remindersData.stats);
        }
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "hot":
        return "bg-red-100 text-red-800 border-red-200";
      case "warm":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "qualified":
        return "bg-green-100 text-green-800 border-green-200";
      case "disqualified":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReminderIcon = (type: string): React.ReactElement => {
    switch (type.toLowerCase()) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "meeting":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours > -24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
          <Button
            onClick={fetchDashboardData}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your leads and campaigns.
        </p>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Revenue
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {metrics.totalRevenue.formatted}
                  </span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      metrics.totalRevenue.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metrics.totalRevenue.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metrics.totalRevenue.change}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRevenue.subtitle}
            </p>
          </Card>

          {/* New Leads */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  New Leads
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {metrics.newLeads.formatted}
                  </span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      metrics.newLeads.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metrics.newLeads.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metrics.newLeads.change}
                  </span>
                </div>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.newLeads.subtitle}
            </p>
          </Card>

          {/* Active Employees */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Active Employees
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {metrics.activeEmployees.formatted}
                  </span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      metrics.activeEmployees.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metrics.activeEmployees.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metrics.activeEmployees.change}
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeEmployees.subtitle}
            </p>
          </Card>

          {/* Conversion Rate */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Conversion Rate
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {metrics.conversionRate.formatted}
                  </span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      metrics.conversionRate.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metrics.conversionRate.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metrics.conversionRate.change}
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.conversionRate.subtitle}
            </p>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Leads
            </h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentLeads.length > 0 ? (
              recentLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {lead.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead.company || lead.email || "No company"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(lead.tag)}>
                      {lead.tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent leads</p>
                <p className="text-sm">Add some leads to see them here</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Upcoming Reminders
              </h2>
              {reminderStats && (
                <p className="text-sm text-muted-foreground">
                  {reminderStats.pending} pending • {reminderStats.overdue}{" "}
                  overdue
                </p>
              )}
            </div>
            <AddReminderModal onReminderAdded={fetchDashboardData} />
          </div>

          <div className="space-y-3">
            {reminders && (
              <>
                {/* Overdue */}
                {reminders.overdue.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-3 p-3 border-l-4 border-red-500 bg-red-500/10 backdrop-blur-sm rounded-r"
                  >
                    <div className="text-red-600">
                      {getReminderIcon(reminder.reminderType)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {reminder.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reminder.lead?.name} • Overdue
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  </div>
                ))}

                {/* Today */}
                {reminders.today.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-3 p-3 border-l-4 border-orange-500 bg-orange-500/10 backdrop-blur-sm rounded-r"
                  >
                    <div className="text-orange-600">
                      {getReminderIcon(reminder.reminderType)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {reminder.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reminder.lead?.name} •{" "}
                        {formatDate(reminder.reminderDate)}
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      Today
                    </Badge>
                  </div>
                ))}

                {/* Tomorrow & This Week */}
                {[...reminders.tomorrow, ...reminders.thisWeek.slice(0, 3)].map(
                  (reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-500/10 backdrop-blur-sm rounded-r"
                    >
                      <div className="text-blue-600">
                        {getReminderIcon(reminder.reminderType)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {reminder.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {reminder.lead?.name} •{" "}
                          {formatDate(reminder.reminderDate)}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {reminder.priority}
                      </Badge>
                    </div>
                  )
                )}
              </>
            )}

            {reminders &&
              reminders.overdue.length === 0 &&
              reminders.today.length === 0 &&
              reminders.tomorrow.length === 0 &&
              reminders.thisWeek.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming reminders</p>
                  <p className="text-sm">Create reminders to stay organized</p>
                </div>
              )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Follow-up
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Send Campaign
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={fetchDashboardData}
          >
            <TrendingUp className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </Card>

      {showAddModal && (
        <LeadsAddModal
          onClose={() => setShowAddModal(false)}
          onLeadAdded={fetchDashboardData}
        />
      )}
    </div>
  );
}
