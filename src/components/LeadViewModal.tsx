"use client";

import React from "react";
import { X, Mail, Phone, Building2, CalendarDays, Globe, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  tag: string;
  value: string;
  created: string;
}

interface LeadViewModalProps {
  lead: Lead;
  closePopup: () => void;
}

const LeadViewModal: React.FC<LeadViewModalProps> = ({ lead, closePopup }) => {
  const getTagColor = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower === "hot") return "bg-red-100 text-red-600 border-red-300";
    if (lower === "warm") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-blue-100 text-blue-600 border-blue-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-foreground rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.3)] w-full max-w-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Lead Overview</h2>
            <p className="text-sm text-muted-foreground">
              Detailed information about this lead
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={closePopup}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-lg">{lead.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{lead.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{lead.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{lead.company || "—"}</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">{lead.source}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(lead.created).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Stage</p>
              <Badge variant="secondary" className="px-3 py-1 text-sm capitalize">
                {lead.stage || "—"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Tag</p>
              <Badge
                variant="outline"
                className={`${getTagColor(lead.tag)} px-3 py-1 text-sm capitalize`}
              >
                {lead.tag}
              </Badge>
            </div>

            {/* <div>
              <p className="text-sm text-muted-foreground mb-1">Value</p>
              <p className="px-3 py-2 bg-secondary/60 rounded-md font-medium">
                {lead.value || "—"}
              </p>
            </div> */}
          </div>
        </div>

        {/* Footer */}
        {/* <div className="p-4 border-t border-border bg-gradient-to-r from-transparent to-primary/5 flex justify-end">
          <Button
            onClick={closePopup}
            className="bg-primary hover:bg-primary/90 text-white px-6"
          >
            Close
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default LeadViewModal;
