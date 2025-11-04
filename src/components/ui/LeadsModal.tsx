"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Toggelbtn  from "@/components/ui/Toggelbtn";
import { X, Save, Trash2 } from "lucide-react";
import { User, Building, Clock } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes?: string;
  Role?: string;
  active?: boolean;
  whatsapp?: boolean;
}

interface Props {
  popup: "view" | "edit" | "delete" | null;
  lead: Lead | null;
  closePopup: () => void;
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

export default function LeadsModal({
  popup,
  lead,
  closePopup,
  onUpdateLead,
  onDeleteLead,
}: Props) {
  const [form, setForm] = useState<Partial<Lead>>({
    Role: "",
    active: false,
    whatsapp: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (popup === "edit" && lead) {
      setForm({
        Role: lead.Role || "",
        active: lead.active ?? false,
        whatsapp: lead.whatsapp ?? false,
      });
    }
  }, [popup, lead]);

  if (!popup || !lead) return null;

  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSwitch = (name: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    await onUpdateLead(lead.id, form);
    setLoading(false);
    closePopup();
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDeleteLead(lead.id);
    setLoading(false);
    closePopup();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black text-white rounded-xl w-full max-w-lg shadow-xl animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold capitalize">{popup} Lead</h2>
          <Button variant="ghost" size="icon" onClick={closePopup}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">

          {/* VIEW MODE */}
          {popup === "view" && (
            <div className="space-y-6">
              {/* Top User Info */}
              <div className="rounded-lg p-4 border border-gray-700">
                <p><b>Email:</b> {lead.email}</p>
                <p><b>Name:</b> {lead.name}</p>
                <button className="mt-2 px-3 py-1 border border-green-500 text-green-600 rounded-md text-sm">
                  {lead.active ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Personal Info */}
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-white" />
                  <h1 className="font-semibold text-lg">Personal Info</h1>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><b>Name:</b> {lead.name}</p>
                  <p><b>Email:</b> {lead.email}</p>
                  <p><b>Phone:</b> {lead.phone}</p>
                  <p><b>Location:</b> Delhi</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-5 h-5 text-white" />
                  <h1 className="font-semibold text-lg">Account Info</h1>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><b>User ID:</b> {lead.id}</p>
                  <p><b>Role:</b> {lead.Role || "—"}</p>
                  <p><b>Company:</b> {lead.company}</p>
                  <p><b>WhatsApp:</b> {lead.whatsapp ? "Enabled" : "Disabled"}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-white" />
                  <h1 className="font-semibold text-lg">Account Timeline</h1>
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {popup === "edit" && (
            <>
            <label className="pl-1">Role</label>
              <Input
                name="Role"
                value={form.Role || ""}
                onChange={handleChange}
                placeholder="Employee"
                className="mb-4"
              />

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700">
                <div>
                  <h2 className="font-semibold text-sm">Active Status</h2>
                  <p className="text-xs text-gray-400">Enable or disable user</p>
                </div>
                <Toggelbtn
                  checked={form.active}
                  onCheckedChange={(v) => handleSwitch("active", v)}
                />
              </div>

              {/* WhatsApp Toggle */}
              <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div>
                  <h2 className="font-semibold text-sm">WhatsApp Alerts</h2>
                  <p className="text-xs text-gray-400">Send WhatsApp updates</p>
                </div>
                <Toggelbtn
                  checked={form.whatsapp}
                  onCheckedChange={(v) => handleSwitch("whatsapp", v)}
                />
              </div>
            </>
          )}

          {/* DELETE MODE */}
          {popup === "delete" && (
            <p className="text-center text-red-500">
              Are you sure you want to delete <b>{lead.name}</b>?
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
          {popup === "view" && <Button onClick={closePopup}>Close</Button>}

          {popup === "edit" && (
            <Button onClick={handleUpdate} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          )}

          {popup === "delete" && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              {loading ? "Deleting..." : "Delete"}
            </Button>
          )}

          <Button variant="outline" onClick={closePopup}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
