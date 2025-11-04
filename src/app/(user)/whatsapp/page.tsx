// app/whatsapp/page.tsx (Full Code)

"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  MessageCircle,
  Send,
  Eye,
  Edit,
  MoreVertical,
  TrendingUp,
  Clock, // Added Clock for clarity
  Pause, // Added Pause
  Play, // Added Play
  Trash2, // Added Trash2
  X, // Added X for modal close
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// --- Added Missing Dropdown Imports ---
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
// ------------------------------------

// Interface for Campaign data
interface Campaign {
    name: string;
    status: "Active" | "Completed" | "Paused";
    client: string;
    scheduled: string;
    sent: string;
    responses: number;
    responseRate: string;
    icon: typeof MessageCircle | typeof Clock;
    iconColor: string;
    details?: string; // Added details for modal
}

// --- INITIAL DATA (Renamed from 'campaigns' to 'initialCampaignsData' to avoid conflict) ---
const initialCampaignsData: Campaign[] = [
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
    details: "High-priority flash sale targeting repeat customers.",
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
    details: "Introducing new B2B software features.",
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
    details: "Post-purchase satisfaction survey.",
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
    details: "Automated reminder for upcoming membership expiry.",
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
    details: "Campaign paused due to template approval delay.",
  },
];

const stats = [
    // ... stats array from original code (omitted for brevity)
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

// --- Simple Modal Component (Handles View and Edit Placeholder) ---
interface CampaignActionModalProps {
    popup: "view" | "edit" | null;
    campaign: Campaign | null;
    closePopup: () => void;
}

const CampaignActionModal: React.FC<CampaignActionModalProps> = ({ popup, campaign, closePopup }) => {
    if (!popup || !campaign) return null;

    const modalTitle = popup === "view" ? "Campaign Details" : "Edit Campaign";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60 p-4">
            <div className="bg-card text-foreground rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in duration-300 relative border border-border">
                
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold">{modalTitle}: {campaign.name}</h2>
                    <Button variant="ghost" size="icon" onClick={closePopup}>
                        <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                </div>

                <div className="p-5 space-y-4">
                    {popup === "view" ? (
                        <div className="text-sm space-y-3">
                            <p><strong>Client:</strong> {campaign.client}</p>
                            <p><strong>Status:</strong> <Badge 
                                className={campaign.status === "Active" ? "bg-success/20 text-success" : campaign.status === "Paused" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}
                            >{campaign.status}</Badge></p>
                            <p><strong>Scheduled:</strong> {campaign.scheduled}</p>
                            <p><strong>Sent/Responses:</strong> {campaign.sent} / {campaign.responses} ({campaign.responseRate})</p>
                            <div className="pt-2">
                                <p className="font-semibold text-muted-foreground mb-1">Description:</p>
                                <p className="bg-secondary p-3 rounded-md text-foreground/80">{campaign.details || 'No detailed description available.'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Input defaultValue={campaign.name} placeholder="Campaign Name" />
                            <Input defaultValue={campaign.client} placeholder="Client Name" />
                            <Select defaultValue={campaign.status}>
                                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Paused">Paused</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------------------------------

export default function WhatsAppPage() {
  const router = useRouter();
  // --- FIX 1: Initializing state with the correct data variable ---
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaignsData);
  const [popup, setPopup] = useState<"view" | "edit" | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const closePopup = () => {
    setPopup(null);
    setSelectedCampaign(null);
  };
  
  const openModal = (action: "view" | "edit", campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPopup(action);
  }
  // -------------------------------------------------------------

  const handleAction = (action: string, campaignName: string) => {
    console.log(`${action} clicked for`, campaignName);

    if (action === "pause") {
      setCampaigns(
        campaigns.map((c) =>
          c.name === campaignName ? { ...c, status: "Paused" as "Paused" } : c
        )
      );
    }
    if (action === "delete") {
      // Add a confirmation dialog here in a real application
      setCampaigns(campaigns.filter((c) => c.name !== campaignName));
    }
    if (action === "restart") {
      setCampaigns(
        campaigns.map((c) =>
          c.name === campaignName ? { ...c, status: "Active" as "Active" } : c
        )
      );
    }
  };

  return (
    <div>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              WhatsApp Campaigns
            </h2>
            <p className="text-sm text-muted-foreground">
              Create and manage WhatsApp marketing campaigns for your clients
            </p>
          </div>
          <Button
            onClick={() => router.push("/Campaigns")}
            className="bg-success hover:bg-success/90 text-white"
          >
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
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <span className="text-sm font-medium text-success">
                    {stat.change}
                  </span>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${stat.color}/20 flex items-center justify-center`}
                >
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
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10 bg-card border-border"
            />
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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Active Only
          </Button>
          <Button variant="outline" className="border-border">
            High Priority
          </Button>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.name} className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl ${campaign.iconColor}/20 flex items-center justify-center`}
                  >
                    <campaign.icon
                      className={`w-6 h-6 ${
                        campaign.iconColor === "bg-success"
                          ? "text-success"
                          : "text-warning"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {campaign.name}
                      </h3>
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
                        <Badge
                          variant="secondary"
                          className="bg-destructive/20 text-destructive"
                        >
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
                      <div className="text-2xl font-bold text-foreground">
                        {campaign.responses}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Responses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {campaign.responseRate}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Response Rate
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* --- BUTTON FIX: Open View Modal --- */}
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openModal("view", campaign)}
                    >
                      <Eye className="w-5 text-info hover:text-info/80" />
                    </Button>
                    {/* --- BUTTON FIX: Open Edit Modal --- */}
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openModal("edit", campaign)}
                    >
                      <Edit className="w-5 text-warning hover:text-warning/80" />
                    </Button>

                    {/* 3 Dots Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black text-white border-border">
                        <DropdownMenuItem onClick={() => router.push("/Campaigns")}>
                          <Plus className="w-4 mr-2" /> Create New
                        </DropdownMenuItem>

                        {campaign.status === "Active" ? (
                          <DropdownMenuItem onClick={() => handleAction("pause", campaign.name)}>
                            <Pause className="w-4 mr-2" /> Pause Campaign
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction("restart", campaign.name)}>
                            <Play className="w-4 mr-2" /> Restart
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="text-destructive text-red-600 focus:bg-destructive/10" onClick={() => handleAction("delete", campaign.name)}>
                          <Trash2 className="w-4 mr-2 text-red-600" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* --- MODAL INTEGRATION --- */}
      <CampaignActionModal 
        popup={popup}
        campaign={selectedCampaign}
        closePopup={closePopup}
      />
    </div>
  );
}