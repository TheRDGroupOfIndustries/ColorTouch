"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast, { Toaster } from "react-hot-toast";

export interface Campaign {
  id: string;
  campaignName: string;
  description?: string;
  campaignType: string;
  priority: string;
  messageType: string;
  messageContent: string;
  mediaURL?: string;
  templateID?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status?: "Active" | "Completed" | "Paused";
}

export interface CampaignActionModalProps {
  popup: "view" | "edit" | null;
  campaign: Campaign | null;
  closePopup: () => void;
  refreshData?: () => void;
}

const CampaignActionModal: React.FC<CampaignActionModalProps> = ({
  popup,
  campaign,
  closePopup,
  refreshData,
}) => {
  const [form, setForm] = useState({
    campaignName: "",
    description: "",
    priority: "NORMAL",
  });
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);

  // ✅ Prefetch when modal opens for editing
  useEffect(() => {
    if (popup !== "edit" || !campaign?.id) return;

    const fetchCampaign = async () => {
      try {
        setPrefilling(true);
        const res = await fetch(`/api/campaigns/${campaign.id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch campaign data");
        const data = await res.json();
        console.log("Fetched campaign data:", data);

        setForm({
          campaignName: data.campaignName || "",
          description: data.description || "",
          priority: data.priority || "NORMAL",
        });
      } catch (err) {
        console.error("❌ Error fetching campaign:", err);
        toast.error("Failed to load campaign data.");
      } finally {
        setPrefilling(false);
      }
    };

    // 🕐 Small delay helps ensure modal transition finishes before fetching
    const timer = setTimeout(fetchCampaign, 100);
    return () => clearTimeout(timer);
  }, [popup, campaign?.id]);

  if (!popup || !campaign) return null;

  const modalTitle = popup === "view" ? "Campaign Details" : "Edit Campaign";

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: form.campaignName,
          description: form.description,
          priority: form.priority.toUpperCase(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update campaign");
      }

      toast.success("✅ Campaign updated successfully!");
      refreshData?.();
      closePopup();
    } catch (error) {
      console.error(error);
      toast.error("❌ Error updating campaign");
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60 p-4">
      <Toaster position="top-right" />
      <div className="bg-card text-foreground rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in duration-300 relative border border-border">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {modalTitle}: {campaign.campaignName}
          </h2>
          <Button variant="ghost" size="icon" onClick={closePopup}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {popup === "view" ? (
            // --- View Mode ---
            <div className="text-sm space-y-3">
              <p>
                <strong>Campaign Type:</strong> {campaign.campaignType}
              </p>
              <p>
                <strong>Priority:</strong>{" "}
                <Badge
                  className={
                    campaign.priority === "HIGH" || campaign.priority === "URGENT"
                      ? "bg-red-500/20 text-red-500"
                      : campaign.priority === "MEDIUM"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-blue-500/20 text-blue-500"
                  }
                >
                  {campaign.priority}
                </Badge>
              </p>
              <p>
                <strong>Message Type:</strong> {campaign.messageType}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
              <div className="pt-2">
                <p className="font-semibold text-muted-foreground mb-1">
                  Message Content:
                </p>
                <p className="bg-secondary p-3 rounded-md text-foreground/80">
                  {campaign.messageContent || "No message content."}
                </p>
              </div>

              {campaign.description && (
                <div className="pt-2">
                  <p className="font-semibold text-muted-foreground mb-1">
                    Description:
                  </p>
                  <p className="bg-secondary p-3 rounded-md text-foreground/80">
                    {campaign.description}
                  </p>
                </div>
              )}

              {campaign.mediaURL && (
                <p>
                  <strong>Media URL:</strong> {campaign.mediaURL}
                </p>
              )}
              {campaign.templateID && (
                <p>
                  <strong>Template ID:</strong> {campaign.templateID}
                </p>
              )}
            </div>
          ) : (
            // --- Edit Mode ---
            <div className="space-y-4">
              {prefilling ? (
                <p className="text-center text-muted-foreground">
                  Loading campaign data...
                </p>
              ) : (
                <>
                  <Input
                    value={form.campaignName}
                    onChange={(e) => handleChange("campaignName", e.target.value)}
                    placeholder="Campaign Name"
                  />

                  <Input
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Description"
                  />

                  <Select
                    value={form.priority}
                    onValueChange={(val) => handleChange("priority", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignActionModal;
