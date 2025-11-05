"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
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
  onLeadAdded: () => void; // ✅ to refresh after adding
}

const LeadsAddModal: React.FC<LeadsAddModalProps> = ({ onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    tag: "cold",
    source: "Website",
    notes: "",
    duration: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LeadFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to create lead");
      }

      toast.success("✅ Lead added successfully!");
      onLeadAdded(); // ✅ Refresh leads
      onClose(); // Close modal
    } catch (err: any) {
      console.error("Error creating lead:", err);
      toast.error(`❌ ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card text-foreground rounded-lg shadow-xl w-full max-w-md p-6 relative border border-border">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Lead</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <Input
            placeholder="Company"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
          />
          <Input
            placeholder="Tag (HOT, WARM, COLD)"
            value={formData.tag}
            onChange={(e) => handleChange("tag", e.target.value)}
          />
          <Input
            placeholder="Source (Google, Website, etc.)"
            value={formData.source}
            onChange={(e) => handleChange("source", e.target.value)}
          />
          <Input
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Duration (optional)"
            value={formData.duration}
            onChange={(e) => handleChange("duration", Number(e.target.value))}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Lead"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadsAddModal;
