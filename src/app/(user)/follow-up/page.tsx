"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FollowModels from "@/components/ui/FollowModels";

interface Activity {
  id: number;
  name: string;
  company: string;
  type: string;
  priority: "Low" | "Medium" | "High";
  scheduled: string;
  time: string;
  status: "Overdue" | "Pending" | "Completed";
  avatar: string;
}

// Lead is an alias of Activity, so they are structurally the same
interface Lead extends Activity {}

const stats = [
  {
    title: "Urgent",
    subtitle: "Overdue Follow-ups",
    value: "8",
    icon: AlertCircle,
    color: "bg-destructive",
  },
  {
    title: "Today",
    subtitle: "Due Today",
    value: "15",
    icon: Clock,
    color: "bg-warning",
  },
  {
    title: "This Week",
    subtitle: "Scheduled",
    value: "42",
    icon: CalendarIcon,
    color: "bg-info",
  },
  {
    title: "Completed",
    value: "127",
    change: "+18%",
    icon: CheckCircle,
    color: "bg-success",
  },
];

// This will be populated from the database
const initialActivities: Activity[] = [];

const quickFilters = [
  { label: "Overdue", value: "overdue", variant: "destructive" as const },
  { label: "High Priority", value: "high", variant: "default" as const },
  { label: "Calls Due", value: "calls", variant: "default" as const },
  { label: "Clear All", value: "clear", variant: "ghost" as const },
];

const activityToLead = (activity: Activity): Lead => activity as Lead;

const Page = () => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [statsCounts, setStatsCounts] = useState({
    urgent: 0,
    today: 0,
    thisWeek: 0,
    completed: 0,
  });
  const [popup, setPopup] = useState<null | "view" | "edit">(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch leads with FOLLOW_UP status from database
  const fetchFollowUpLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const leads = Array.isArray(data) ? data : data.leads || [];
      
      // Filter only FOLLOW_UP leads and transform to Activity format
      const followUpLeads = leads
        .filter((lead: any) => lead.status === 'FOLLOW_UP')
        .map((lead: any, index: number) => ({
          id: parseInt(lead.id.slice(-6), 16) || index + 1, // Convert part of ID to number
          name: lead.name,
          company: lead.company || 'Unknown Company',
          type: 'Follow-Up',
          priority: lead.tag === 'HOT' ? 'High' : lead.tag === 'WARM' ? 'Medium' : 'Low',
          scheduled: new Date(lead.createdAt).toLocaleDateString(),
          time: new Date(lead.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          status: 'Pending' as const,
          avatar: lead.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        }));
      
      setActivities(followUpLeads);
      // Also fetch reminders and compute stats for FOLLOW_UP reminders
      try {
        const remRes = await fetch('/api/reminders?timeframe=all', { cache: 'no-store' });
        if (remRes.ok) {
          const remData = await remRes.json();
          const grouped = remData.groupedReminders || {};

          const filterFollow = (arr: any[] = []) =>
            arr.filter((r: any) => r.reminderType === 'FOLLOW_UP');

          const urgent = filterFollow(grouped.overdue || []).length;
          const today = filterFollow(grouped.today || []).length;
          const thisWeek = filterFollow(grouped.thisWeek || []).length;
          const completed = filterFollow(grouped.completed || []).length;

          setStatsCounts({ urgent, today, thisWeek, completed });
        } else {
          console.warn('Failed to fetch reminders for stats');
        }
      } catch (remErr) {
        console.error('Error fetching reminders:', remErr);
      }
    } catch (error) {
      console.error('Error fetching follow-up leads:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFollowUpLeads();
  }, []);

  const handleCompleteActivity = (activityId: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    console.log(
      `Activity ID: ${activityId} marked as completed and removed from list.`
    );
  };

  const handleUpdateLead = async (
    leadId: string | number,
    data: Partial<Lead>
  ): Promise<void> => {
    console.log(`Simulating update for lead ${leadId} with data:`, data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Update the state with the new data
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === leadId ? { ...activity, ...data } : activity
      )
    );
    // Also update the selectedLead if it was the one being edited
    setSelectedLead((prevLead) =>
      prevLead && prevLead.id === leadId ? { ...prevLead, ...data } : prevLead
    );

    closePopup();
  };

  // FIX 2: Moved openModal to the correct scope (inside Page component)
  const openModal = (
    action: "view" | "edit",
    lead: Lead // Use Lead type
  ) => {
    setSelectedLead(lead);
    setPopup(action);
  };

  // FIX 3: Moved closePopup to the correct scope (inside Page component)
  const closePopup = () => setPopup(null);

  return (
    <div>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Leads Follow-Up
            </h2>
            <p className="text-sm text-muted-foreground">
              Track and manage your lead follow-up activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border">
              <CalendarIcon className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button variant="outline" className="border-border">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Follow-Up
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            // pick dynamic values when available
            let value = stat.value;
            if (stat.title === 'Urgent') value = String(statsCounts.urgent ?? stat.value);
            if (stat.title === 'Today') value = String(statsCounts.today ?? stat.value);
            if (stat.title === 'This Week') value = String(statsCounts.thisWeek ?? stat.value);
            if (stat.title === 'Completed') value = String(statsCounts.completed ?? stat.value);

            return (
              <Card key={stat.title} className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                    )}
                    {stat.change && (
                      <span className="text-sm font-medium text-success">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.color}/20 flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${
                        stat.color === "bg-destructive"
                          ? "text-destructive"
                          : stat.color === "bg-warning"
                          ? "text-warning"
                          : stat.color === "bg-info"
                          ? "text-info"
                          : "text-success"
                      }`}
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {value}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search leads or companies..."
              className="pl-10 bg-card border-border"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Quick filters:</span>
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={filter.variant}
              size="sm"
              className={
                filter.variant === "destructive"
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                  : filter.variant === "ghost"
                  ? ""
                  : "bg-warning/20 text-warning hover:bg-warning/30"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Activities Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Follow-Up Activities
            </h3>
            <span className="text-sm text-muted-foreground">
              {activities.length} activities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    LEAD
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    TYPE
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    PRIORITY
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    SCHEDULED DATE
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    STATUS
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading follow-up leads...
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No follow-up leads found. Leads with "FOLLOW_UP" status will appear here.
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-border hover:bg-secondary/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-info">
                            <AvatarFallback className="text-white font-semibold">
                              {activity.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {activity.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{activity.type}</td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={
                            activity.priority === "High"
                              ? "bg-destructive/20 text-destructive"
                              : activity.priority === "Medium"
                              ? "bg-warning/20 text-warning"
                              : "bg-success/20 text-success"
                          }
                        >
                          {activity.priority}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-foreground">
                          {activity.scheduled}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.time}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={
                            activity.status === "Overdue"
                              ? "bg-destructive/20 text-destructive"
                              : activity.status === "Pending"
                              ? "bg-warning/20 text-warning"
                              : "bg-success/20 text-success"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            onClick={() =>
                              openModal("view", activityToLead(activity))
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                            onClick={() => handleCompleteActivity(activity.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              openModal("edit", activityToLead(activity))
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <FollowModels
        popup={popup}
        lead={selectedLead}
        closePopup={closePopup}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
};

export default Page;
