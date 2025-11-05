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
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast, { Toaster } from "react-hot-toast";
import CampaignActionModal, {
  Campaign as BaseCampaign,
} from "@/components/CampaignActionModal";

interface UICampaign extends BaseCampaign {
  icon?: any;
  iconColor?: string;
}

export default function WhatsAppPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<UICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<"view" | "edit" | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<UICampaign | null>(
    null
  );

  // --- Fetch all campaigns from DB ---
  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();

      const formatted: UICampaign[] = data.map((c: any) => ({
        ...c,
        icon: MessageCircle,
        iconColor: c.status === "Active" ? "bg-success" : "bg-warning",
      }));

      setCampaigns(formatted);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("❌ Failed to load campaigns");
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

  const openModal = (action: "view" | "edit", campaign: UICampaign) => {
    setSelectedCampaign(campaign);
    setPopup(action);
  };

  // --- Update campaign status in DB ---
  const updateStatus = async (campaignId: string, status: string) => {
    await fetch("/api/campaigns/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, status }),
    });
  };

  // --- Handle UI + backend actions ---
  const handleAction = async (action: string, campaignId: string) => {
    if (action === "pause") {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, status: "Paused" } : c
        )
      );
      await updateStatus(campaignId, "Paused");
      toast("⏸️ Campaign paused");
    }

    if (action === "start" || action === "restart") {
      // 1️⃣ Update UI
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, status: "Active" } : c
        )
      );

      // 2️⃣ Update DB and trigger backend sending
      await updateStatus(campaignId, "Active");
      toast.loading("🚀 Starting campaign...");

      try {
        const res = await fetch("/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId }),
        });
        const data = await res.json();
        toast.dismiss();

        if (!res.ok) {
          console.error("❌ Message sending failed:", data.error);
          toast.error(`Failed: ${data.error}`);
        } else {
          toast.success("✅ Messages are being sent!");
        }
      } catch (error) {
        console.error("❌ Error triggering message sending:", error);
        toast.dismiss();
        toast.error("Error starting message sending");
      }
    }

    if (action === "delete") {
      try {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        toast.success("🗑️ Campaign deleted (local only)");
      } catch (error) {
        console.error("Error deleting campaign:", error);
        toast.error("Failed to delete campaign");
      }
    }
  };

  // --- Stats ---
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
      title: "Marketing Campaigns",
      value: campaigns
        .filter((c) => c.campaignType === "MARKETING")
        .length.toString(),
      change: "marketing type",
      icon: TrendingUp,
      color: "bg-primary",
    },
    {
      title: "High Priority",
      value: campaigns
        .filter((c) => c.priority === "HIGH" || c.priority === "URGENT")
        .length.toString(),
      change: "urgent campaigns",
      icon: MessageCircle,
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
                            : "bg-warning/20 text-warning"
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
                        className="bg-black text-white border-border"
                      >
                        {campaign.status === "Paused" ? (
                          <DropdownMenuItem
                            onClick={() => handleAction("start", campaign.id)}
                          >
                            <Play className="w-4 mr-2" /> Start Campaign
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleAction("pause", campaign.id)}
                          >
                            <Pause className="w-4 mr-2" /> Pause Campaign
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="text-red-600 focus:bg-destructive/10"
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
          ))
        )}
      </div>

      {/* Modal */}
      <CampaignActionModal
        popup={popup}
        campaign={selectedCampaign}
        closePopup={closePopup}
        refreshData={fetchCampaigns}
      />
    </div>
  );
}
