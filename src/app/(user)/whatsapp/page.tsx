"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  MessageCircle,
  Eye,
  Edit,
  MoreVertical,
  TrendingUp,
  PlayCircle,
  Clock, // Added Clock for clarity
  Pause, // Added Pause
  Play, // Added Play
  Trash2, // Added Trash2
  X, // Added X for modal close
  Search, // Added Search for the filter input
  Send, // Added Send for the stats card
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; // Added Input for the search filter
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import toast, { Toaster } from "react-hot-toast";

// --- TEMPORARY INTERFACE (using the expanded one from HEAD for the local modal) ---
interface Campaign {
  id: string; // Key field from the API/DB version
  campaignName: string; // Key field from the API/DB version
  status: "Active" | "Completed" | "Paused";
  client: string; // Keeping for modal display
  scheduled: string; // Keeping for modal display
  sent: string;
  responses: number;
  responseRate: string;
  icon: typeof MessageCircle | typeof Clock;
  iconColor: string;
  details?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; // From API version
  campaignType: string; // From API version
  messageType: string; // From API version
  createdAt: string; // From API version
}

// --- Simple Modal Component (Adapted from HEAD, simplified to use the merged interface) ---
// NOTE: In a real app, you would likely use a dedicated, complex external modal here.
interface CampaignActionModalProps {
  popup: "view" | "edit" | null;
  campaign: Campaign | null;
  closePopup: () => void;
  // Included to match the API version's modal usage, though unused in this simple local modal
  refreshData: () => void; 
}

const CampaignActionModal: React.FC<CampaignActionModalProps> = ({
  popup,
  campaign,
  closePopup,
}) => {
  if (!popup || !campaign) return null;

  const modalTitle = popup === "view" ? "Campaign Details" : "Edit Campaign";

  // Dummy status change logic for the edit modal
  const handleSave = () => {
    toast.success("Changes saved (placeholder)");
    closePopup();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60 p-4">
      <div className="bg-card text-foreground rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in duration-300 relative border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {modalTitle}: {campaign.campaignName}
          </h2>
          <Button variant="ghost" size="icon" onClick={closePopup}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {popup === "view" ? (
            <div className="text-sm space-y-3">
              <p>
                <strong>Client:</strong> {campaign.client || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
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
              </p>
              <p>
                <strong>Created On:</strong> {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Priority:</strong> {campaign.priority}
              </p>
              <div className="pt-2">
                <p className="font-semibold text-muted-foreground mb-1">
                  Description:
                </p>
                <p className="bg-secondary p-3 rounded-md text-foreground/80">
                  {campaign.details || "No detailed description available."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input defaultValue={campaign.campaignName} placeholder="Campaign Name" />
              <Input defaultValue={campaign.client || "N/A"} placeholder="Client Name" />
              <Select defaultValue={campaign.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSave}>
                Save Changes
              </Button>
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<"view" | "edit" | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  // --- Mock/Simulated Campaign Data Fetch (API version logic structure) ---
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // **Simulating a fetch from an API**
      // The data structure used here is a blend of the two versions to make the UI work
      // and resemble the expected API response.
      const mockData = [
        {
          id: "c-001",
          campaignName: "Summer Sale 2024",
          status: "Active",
          client: "Fashion Hub",
          scheduled: "1/20/2024",
          sent: "1,250 sent",
          responses: 340,
          responseRate: "27.2%",
          details: "High-priority flash sale targeting repeat customers.",
          priority: "HIGH",
          campaignType: "MARKETING",
          messageType: "TEMPLATE",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "c-002",
          campaignName: "Product Launch Announcement",
          status: "Paused",
          client: "Tech Solutions Ltd",
          scheduled: "1/18/2024",
          sent: "890 sent",
          responses: 267,
          responseRate: "30.0%",
          details: "Introducing new B2B software features.",
          priority: "MEDIUM",
          campaignType: "UTILITY",
          messageType: "SESSION",
          createdAt: "2024-01-14T10:00:00Z",
        },
        {
          id: "c-003",
          campaignName: "Customer Feedback Survey",
          status: "Completed",
          client: "Food Express",
          scheduled: "1/12/2024",
          sent: "2,100 sent",
          responses: 1470,
          responseRate: "70.0%",
          details: "Post-purchase satisfaction survey.",
          priority: "LOW",
          campaignType: "UTILITY",
          messageType: "TEMPLATE",
          createdAt: "2024-01-10T10:00:00Z",
        },
      ];

      const formatted: Campaign[] = mockData.map((c) => ({
        ...c,
        icon: c.status === "Active" ? MessageCircle : Clock,
        iconColor: c.status === "Active" ? "bg-success" : "bg-warning",
      }));

      setCampaigns(formatted);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("❌ Failed to load campaigns (Simulated Error)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const closePopup = () => {
    setPopup(null);
    setSelectedCampaign(null);
  };

  const openModal = (action: "view" | "edit", campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPopup(action);
  };

  // --- Handle UI + backend actions (API version logic) ---
  const handleAction = async (action: string, campaignId: string) => {
    // **Simulate API calls and status update**

    if (action === "pause") {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, status: "Paused" as "Paused" } : c
        )
      );
      toast("⏸️ Campaign paused (Simulated)");
    }

    if (action === "start" || action === "restart") {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, status: "Active" as "Active" } : c
        )
      );
      
      toast.loading("🚀 Starting campaign... (Simulated)");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating network delay
      toast.dismiss();
      toast.success("✅ Messages are being sent! (Simulated)");
    }

    if (action === "delete") {
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success("🗑️ Campaign deleted (Simulated)");
    }
  };

  // --- Stats (Merged and adapted) ---
  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      change: `${campaigns.length} total`,
      icon: MessageCircle,
      color: "bg-success",
    },
    {
      title: "Active Campaigns",
      value: campaigns.filter((c) => c.status === "Active").length.toString(),
      change: "currently running",
      icon: PlayCircle,
      color: "bg-info",
    },
    {
      title: "Total Messages Sent",
      value: "8,547", // Hardcoded as the mock data doesn't update this
      change: "+1,234 today",
      icon: Send,
      color: "bg-primary",
    },
    {
      title: "High Priority",
      value: campaigns
        .filter((c) => c.priority === "HIGH" || c.priority === "URGENT")
        .length.toString(),
      change: "urgent campaigns",
      icon: TrendingUp,
      color: "bg-warning",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-muted-foreground">
        Loading campaigns...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
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

      {/* Stats */}
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
      
      {/* Filters (from HEAD) */}
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
          Apply Filters
        </Button>
        <Button variant="outline" className="border-border">
          Reset
        </Button>
      </div>
      
      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first WhatsApp campaign to get started
            </p>
            <Button
              onClick={() => router.push("/Campaigns")}
              className="bg-success hover:bg-success/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      campaign.iconColor || "bg-success"
                    }/20 flex items-center justify-center`}
                  >
                    <MessageCircle
                      className={`w-6 h-6 ${
                        campaign.status === "Active"
                          ? "text-success"
                          : "text-warning"
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {campaign.campaignName}
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
                      <Badge
                        variant="outline"
                        className={
                          campaign.priority === "HIGH" ||
                          campaign.priority === "URGENT"
                            ? "border-red-500 text-red-500"
                            : campaign.priority === "MEDIUM"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-blue-500 text-blue-500"
                        }
                      >
                        {campaign.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>📋 {campaign.campaignType}</span>
                      <span>💬 {campaign.messageType}</span>
                      <span>
                        📅 {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openModal("view", campaign)}
                    >
                      <Eye className="w-5 text-info hover:text-info/80" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openModal("edit", campaign)}
                    >
                      <Edit className="w-5 text-warning hover:text-warning/80" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        // Tailwind classes adjusted to assume a light/dark mode context
                        className="bg-popover text-foreground border-border"
                      >
                        {campaign.status === "Active" ? (
                          <DropdownMenuItem
                            onClick={() => handleAction("pause", campaign.id)}
                            className="focus:bg-secondary"
                          >
                            <Pause className="w-4 mr-2" /> Pause Campaign
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleAction("start", campaign.id)}
                            className="focus:bg-secondary"
                          >
                            <Play className="w-4 mr-2" /> Start Campaign
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-600/10 focus:text-red-600"
                          onClick={() => handleAction("delete", campaign.id)}
                        >
                          <Trash2 className="w-4 mr-2 text-red-600" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Modal Integration (using the local placeholder implementation) */}
      <CampaignActionModal
        popup={popup}
        campaign={selectedCampaign}
        closePopup={closePopup}
        refreshData={fetchCampaigns} // Passes the fetch function down
      />
    </div>
  );
}