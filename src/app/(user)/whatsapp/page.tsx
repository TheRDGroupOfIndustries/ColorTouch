import React from "react";
import { Search, Plus, MessageCircle, Send, Eye, Edit, MoreVertical, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stats = [
  {
    title: "Active Campaigns",
    value: "12",
    change: "+3 this week",
    icon: MessageCircle,
    color: "bg-success",
  },
  {
    title: "Total Messages Sent",
    value: "8,547",
    change: "+1,234 today",
    icon: Send,
    color: "bg-info",
  },
  {
    title: "Response Rate",
    value: "68%",
    change: "+5% vs last month",
    icon: MessageCircle,
    color: "bg-primary",
  },
  {
    title: "Conversion Rate",
    value: "24%",
    change: "+2% vs last month",
    icon: TrendingUp,
    color: "bg-warning",
  },
];

const campaigns = [
  {
    name: "Summer Sale 2024",
    status: "Active",
    client: "Fashion Hub",
    scheduled: "1/20/2024",
    sent: "1,250 sent",
    responses: 340,
    responseRate: "27.2%",
    icon: MessageCircle,
    iconColor: "bg-success",
  },
  {
    name: "Product Launch Announcement",
    status: "Active",
    client: "Tech Solutions Ltd",
    scheduled: "1/18/2024",
    sent: "890 sent",
    responses: 267,
    responseRate: "30.0%",
    icon: MessageCircle,
    iconColor: "bg-success",
  },
  {
    name: "Customer Feedback Survey",
    status: "Completed",
    client: "Food Express",
    scheduled: "1/12/2024",
    sent: "2,100 sent",
    responses: 1470,
    responseRate: "70.0%",
    icon: MessageCircle,
    iconColor: "bg-success",
  },
  {
    name: "Membership Renewal Reminder",
    status: "Active",
    client: "Fitness Pro",
    scheduled: "1/19/2024",
    sent: "567 sent",
    responses: 234,
    responseRate: "41.3%",
    icon: Clock,
    iconColor: "bg-warning",
  },
  {
    name: "New Service Introduction",
    status: "Paused",
    client: "Healthcare Plus",
    scheduled: "1/15/2024",
    sent: "0 sent",
    responses: 0,
    responseRate: "0.0%",
    icon: MessageCircle,
    iconColor: "bg-warning",
  },
];

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}


export default function WhatsAppPage() {
  return (
    <div>
      <div className="p-6 space-y-6">
      
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">WhatsApp Campaigns</h2>
                <p className="text-sm text-muted-foreground">
                  Create and manage WhatsApp marketing campaigns for your clients
                </p>
              </div>
              <Button className="bg-success hover:bg-success/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
      
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <span className="text-sm font-medium text-success">{stat.change}</span>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color}/20 flex items-center justify-center`}>
                      <stat.icon
                        className={`w-6 h-6 ${
                          stat.color === "bg-success"
                            ? "text-success"
                            : stat.color === "bg-info"
                            ? "text-info"
                            : stat.color === "bg-primary"
                            ? "text-primary"
                            : "text-warning"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </Card>
              ))}
            </div>
      
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search campaigns..." className="pl-10 bg-card border-border" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48 bg-card border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-48 bg-card border-border">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="fashion">Fashion Hub</SelectItem>
                  <SelectItem value="tech">Tech Solutions Ltd</SelectItem>
                  <SelectItem value="food">Food Express</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Active Only</Button>
              <Button variant="outline" className="border-border">High Priority</Button>
            </div>
      
            {/* Campaigns List */}
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.name} className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl ${campaign.iconColor}/20 flex items-center justify-center`}>
                        <campaign.icon
                          className={`w-6 h-6 ${
                            campaign.iconColor === "bg-success" ? "text-success" : "text-warning"
                          }`}
                        />
                      </div>
      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                          <Badge
                            variant="secondary"
                            className={
                              campaign.status === "Active"
                                ? "bg-success/20 text-success"
                                : campaign.status === "Paused"
                                ? "bg-warning/20 text-warning"
                                : "bg-info/20 text-info"
                            }
                          >
                            {campaign.status}
                          </Badge>
                          {campaign.status === "Active" && (
                            <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                              🚩
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            🏢 {campaign.client}
                          </span>
                          <span className="flex items-center gap-1">
                            📅 Scheduled: {campaign.scheduled}
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {campaign.sent}
                          </span>
                        </div>
                      </div>
      
                      <div className="flex items-center gap-8 mr-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{campaign.responses}</div>
                          <div className="text-xs text-muted-foreground">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{campaign.responseRate}</div>
                          <div className="text-xs text-muted-foreground">Response Rate</div>
                        </div>
                      </div>
      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-info hover:text-info hover:bg-info/10">
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-warning hover:text-warning hover:bg-warning/10">
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-foreground hover:text-foreground hover:bg-secondary">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
    </div>
  );
}
