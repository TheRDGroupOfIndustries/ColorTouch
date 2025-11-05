"use client";

import React, { useState, useEffect } from "react";
import { X, UserPen, Building2, Mail, Phone, StickyNote, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  tag: string;
  source: string;
  notes?: string;
  duration?: number;
}

interface LeadsEditModalProps {
  leadId: string;
  onClose: () => void;
  onLeadUpdated: () => void;
}

const EditEmployee: React.FC<LeadsEditModalProps> = ({
  leadId,
  onClose,
  onLeadUpdated,
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    tag: "",
    source: "",
    notes: "",
    duration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch lead details
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data[0]) throw new Error("Failed to load lead details");
        const lead = data[0];

        setFormData({
          name: lead.name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          company: lead.company || "",
          tag: lead.tag || "",
          source: lead.source || "",
          notes: lead.notes || "",
          duration: lead.duration || 0,
        });
      } catch (err: any) {
        toast.error("❌ Failed to fetch lead data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  const handleChange = (field: keyof LeadFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("⚠️ Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update lead");

      toast.success("✅ Lead updated successfully!");
      onLeadUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error updating lead:", err);
      toast.error(`❌ ${err.message || "Update failed"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="bg-card rounded-xl p-8 flex flex-col items-center justify-center shadow-xl border border-border">
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading lead data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900 dark:to-gray-950 text-foreground rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.2)] w-full max-w-2xl border border-gray-200/40 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2">
            <UserPen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Edit Lead</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-background/50 border-border"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-background/50 border-border"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Phone *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-background/50 border-border"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="bg-background/50 border-border"
                placeholder="Company"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Tag</label>
              <Input
                value={formData.tag}
                onChange={(e) => handleChange("tag", e.target.value)}
                className="bg-background/50 border-border"
                placeholder="Hot / Warm / Cold"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Source</label>
              <Input
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="bg-background/50 border-border"
                placeholder="Source"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Duration (Days)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", Number(e.target.value))}
                className="bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-primary/40 resize-none h-24 px-3 py-2"
                placeholder="Enter notes..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200/60 bg-gradient-to-r from-transparent to-primary/5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;
