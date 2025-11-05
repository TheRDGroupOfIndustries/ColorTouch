"use client";

import {
  Search,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash,
  Users,
  UserPlus,
  CheckCircle,
  Flame,
} from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LeadsModal from "@/components/ui/LeadsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import LeadsAddModal from "@/components/LeadsAddModal";

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
  avatar?: string;
}

const getSourceIcon = (source: string) => {
  const icons: { [key: string]: string } = {
    Facebook: "f",
    Google: "G",
    Website: "🌐",
    Referral: "👥",
    Instagram: "📷",
  };
  return icons[source] || "•";
};

export default function LeadsPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [popup, setPopup] = useState<null | "add" | "view" | "edit" | "delete">(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const closePopup = () => setPopup(null);

  // ✅ Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : data.leads || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ Delete lead via API
  const handleDeleteLead = async (leadId: string): Promise<void> => {
    try {
      toast.loading("Deleting lead...");
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      const data = await res.json();
      toast.dismiss();

      if (!res.ok) {
        toast.error(`❌ Failed to delete: ${data.error || "Unknown error"}`);
        return;
      }

      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
      toast.success("🗑️ Lead deleted successfully!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.dismiss();
      toast.error("Something went wrong while deleting the lead");
    }
  };

  const handleUpdateLead = async (leadId: string, data: Partial<Lead>) => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // placeholder
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, ...data } : lead))
    );
  };

  const openModal = (action: "view" | "edit" | "delete", lead: Lead | null) => {
    setSelectedLead(lead);
    setPopup(action);
  };

  // 🧮 Stats
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const newThisWeek = leads.filter((lead) => {
      const createdDate = new Date(lead.created);
      return createdDate >= oneWeekAgo && createdDate <= now;
    }).length;

    const hotLeads = leads.filter(
      (lead) => lead.tag.toLowerCase() === "hot"
    ).length;

    return [
      {
        title: "Total Leads",
        value: totalLeads.toString(),
        icon: Users,
        color: "bg-info",
      },
      {
        title: "New This Week",
        value: newThisWeek.toString(),
        icon: UserPlus,
        color: "bg-info",
      },
      {
        title: "Converted",
        value: "—",
        icon: CheckCircle,
        color: "bg-success",
      },
      {
        title: "Hot Leads",
        value: hotLeads.toString(),
        icon: Flame,
        color: "bg-warning",
      },
    ];
  }, [leads]);

  // 🔍 Filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.company.toLowerCase().includes(search.toLowerCase());

      const matchesStage =
        selectedStage && selectedStage !== "all"
          ? lead.stage.toLowerCase() === selectedStage.toLowerCase()
          : true;

      const matchesTag =
        selectedTag && selectedTag !== "all"
          ? lead.tag.toLowerCase() === selectedTag.toLowerCase()
          : true;

      return matchesSearch && matchesStage && matchesTag;
    });
  }, [leads, search, selectedStage, selectedTag]);

  // ✅ UI (unchanged)
  return (
    <div className="p-6 space-y-6">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Lead Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your leads efficiently
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onMouseEnter={() => setHovered("facebook")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaFacebook className="mr-2 text-[#0866ff]" />
            {hovered === "facebook" ? "Coming Soon" : "Import from Meta"}
          </Button>

          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onMouseEnter={() => setHovered("google")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaGoogle className="mr-2" />
            {hovered === "google" ? "Coming Soon" : "Import from Google"}
          </Button>

          <Button
            onClick={() => router.push("/leadform")}
            variant="outline"
            className="border-success text-success hover:bg-success/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div
                className={`w-12 h-12 rounded-xl ${stat.color}/20 flex items-center justify-center`}
              >
                <stat.icon
                  className={`w-6 h-6 ${
                    stat.color === "bg-info"
                      ? "text-info"
                      : stat.color === "bg-success"
                      ? "text-success"
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
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <Select onValueChange={setSelectedTag}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Filter by Tag" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Leads ({filteredLeads.length})
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading leads...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No leads found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {[
                    "Lead",
                    "Contact",
                    "Source",
                    "Stage",
                    "Tag",
                    "Value",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left p-4 text-sm font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-info">
                          <AvatarFallback className="bg-info text-white font-semibold">
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {lead.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lead.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">{lead.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.phone}
                      </div>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <span className="text-lg">{getSourceIcon(lead.source)}</span>
                      <span className="text-sm text-foreground">{lead.source}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{lead.stage}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{lead.tag}</Badge>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {lead.value}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {lead.created}
                    </td>
                    <td className="p-4 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-info hover:bg-info/10"
                        onClick={() => openModal("view", lead)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-warning hover:bg-warning/10"
                        onClick={() => openModal("edit", lead)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        <Trash className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ✅ Real modal added here */}
      {showAddModal && (
        <LeadsAddModal
          onClose={() => setShowAddModal(false)}
          onLeadAdded={fetchLeads}
        />
      )}
    </div>
  );
}
