"use client";

import React, { useState } from "react";
import { X, UserPlus, Building2, Mail, Phone, StickyNote } from "lucide-react";
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

interface LeadsAddModalProps {
  onClose: () => void;
  onLeadAdded: () => void;
}

const LeadsAddModal: React.FC<LeadsAddModalProps> = ({ onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    tag: "Cold",
    source: "Website",
    notes: "",
    duration: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LeadFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("⚠️ Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lead");

      toast.success("✅ Lead added successfully!");
      onLeadAdded();
      onClose();
    } catch (err: any) {
      console.error("Error creating lead:", err);
      toast.error(`❌ ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative bg-gradient-to-b from-white/90 to-white/70 dark:from-gray-900 dark:to-gray-950 text-foreground rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.2)] w-full max-w-2xl border border-gray-200/40 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Add New Lead</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name *</label>
              <div className="relative mt-1">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  className="pl-9 rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Company</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  className="pl-9 rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Email *</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="email"
                  className="pl-9 rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Phone *</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="tel"
                  className="pl-9 rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Tag</label>
              <Input
                className="rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                placeholder="Hot / Warm / Cold"
                value={formData.tag}
                onChange={(e) => handleChange("tag", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Source</label>
              <Input
                className="rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                placeholder="Website, Google Ads, etc."
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Duration (optional)</label>
              <Input
                type="number"
                className="rounded-lg bg-background/50 border-border focus:ring-2 focus:ring-primary/40"
                placeholder="Days"
                value={formData.duration}
                onChange={(e) => handleChange("duration", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Notes (optional)</label>
              <div className="relative mt-1">
                <StickyNote className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                <textarea
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-primary/40 resize-none h-20"
                  placeholder="Enter additional notes..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="flex justify-end gap-3 p-5 border-t border-gray-200/60 bg-gradient-to-r from-transparent to-primary/5">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Lead"}
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default LeadsAddModal;
