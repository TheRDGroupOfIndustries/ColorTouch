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
import LeadViewModal from "@/components/LeadViewModal";
import LeadsEditModal from "@/components/LeadEditModal";
import { SelectGroup, SelectLabel } from "@/components/ui/select";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  tag: string;
  status: string;
  value: string;
  created: string;
  createdAt?: string;
  updatedAt?: string;
  leadsCreatedDate?: string;
  leadsUpdatedDates?: string;
  enquiryDate?: string;
  bookingDate?: string;
  checkInDates?: string;
  avatar?: string;
  notes?: string;
  duration?: number;
  amount?: number;
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

const getCompanyLogo = (company: string) => {
  const firstLetter = company.charAt(0).toUpperCase();
  const colors = {
    'A': 'bg-blue-600',
    'B': 'bg-green-600',
    'C': 'bg-purple-600',
    'D': 'bg-red-600',
    'E': 'bg-yellow-600',
    'F': 'bg-indigo-600',
    'G': 'bg-pink-600',
    'H': 'bg-gray-600',
    'I': 'bg-blue-500',
    'J': 'bg-green-500',
    'K': 'bg-purple-500',
    'L': 'bg-red-500',
    'M': 'bg-yellow-500',
    'N': 'bg-indigo-500',
    'O': 'bg-pink-500',
    'P': 'bg-gray-500',
    'Q': 'bg-blue-700',
    'R': 'bg-green-700',
    'S': 'bg-purple-700',
    'T': 'bg-red-700',
    'U': 'bg-yellow-700',
    'V': 'bg-indigo-700',
    'W': 'bg-pink-700',
    'X': 'bg-gray-700',
    'Y': 'bg-blue-800',
    'Z': 'bg-green-800',
  };
  return colors[firstLetter as keyof typeof colors] || 'bg-gray-600';
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [popup, setPopup] = useState<null | "add" | "view" | "edit" | "delete">(
    null
  );
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const closePopup = () => setPopup(null);

  // ✅ Fetch leads from API
  const exportLeads = () => {
    if (filteredLeads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    // Create CSV content
    const headers = ["name", "email", "phone", "company", "notes", "source", "tag", "duration", "amount", "leadsCreatedDate", "leadsUpdatedDates", "enquiryDate", "bookingDate", "checkInDates"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => {
        const meta = parseMetaDatesFromNotes(lead.notes);
        const createdVal = lead.leadsCreatedDate || lead.createdAt || '';
        const updatedVal = lead.leadsUpdatedDates || lead.updatedAt || '';
        const enquiryVal = lead.enquiryDate || meta.enquiryDate || '';
        const bookingVal = lead.bookingDate || meta.bookingDate || '';
        const checkInVal = lead.checkInDates || meta.checkInDates || '';

        return [
          `"${lead.name || ""}"`,
          `"${lead.email || ""}"`,
          `"${lead.phone || ""}"`,
          `"${lead.company || ""}"`,
          `"${lead.notes || ""}"`,
          `"${lead.source || ""}"`,
          `"${lead.tag || ""}"`,
          lead.duration || 0,
          lead.amount || 0,
          `"${createdVal}"`,
          `"${updatedVal}"`,
          `"${enquiryVal}"`,
          `"${bookingVal}"`,
          `"${checkInVal}"`
        ].join(",");
      })
    ].join("\\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredLeads.length} leads successfully!`);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log("Fetch leads response:", data);
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

  const handleUpdateLead = async (leadId: string, formData: Partial<Lead>) => {
       if (!leadId || !formData) {
         toast.error("⚠️ Please fill all required fields");
         return;
       }

       try {
         const res = await fetch(`/api/leads/${leadId}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(formData),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Failed to update lead");

         toast.success(" Lead updated successfully!");
         fetchLeads();
       } catch (err: any) {
         console.error("Error updating lead:", err);
         toast.error(` ${err.message || "Update failed"}`);
       } 
     
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

      const matchesStatus =
        selectedStatus && selectedStatus !== "all"
          ? lead.status === selectedStatus
          : true;

      const matchesTag =
        selectedTag && selectedTag !== "all"
          ? lead.tag.toLowerCase() === selectedTag.toLowerCase()
          : true;

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [leads, search, selectedStatus, selectedTag]);

  // ✅ UI (unchanged)
  return (
    <div className="p-6 space-y-6 overflow-hidden max-w-full">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Lead Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your leads efficiently
          </p>
        </div>

        <div className="flex gap-2">
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

        <Select onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="border-gray-800 bg-black text-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
            <SelectItem value="CONVERTED">Converted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedTag}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Filter by Tag" />
          </SelectTrigger>
          <SelectContent className="border-gray-800 bg-black text-white">
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
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border cursor-pointer"
              onClick={exportLeads}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
              <span>Loading leads...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No leads found
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[1600px]">
              <thead className="border-b border-border">
                <tr>
                  {[
                    "Lead",
                    "Email",
                    "Phone",
                    "Company",
                    "Source",
                    "Tag",
                    "Status",
                    "Created",
                    "Updated",
                    "Enquiry",
                    "Booking",
                    "Check-in",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`text-left p-4 text-sm font-medium text-muted-foreground ${h === 'Actions' ? 'sticky right-0 bg-background border-l border-border z-20' : ''} min-w-[140px]`}
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground sticky right-0 bg-background border-l border-border min-w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border hover:bg-secondary/50"
                  >
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
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">{lead.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${getCompanyLogo(lead.company)}`}>
                          {lead.company.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm text-foreground">
                          {lead.company}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <span className="text-lg">
                        {getSourceIcon(lead.source)}
                      </span>
                      <span className="text-sm text-foreground">
                        {lead.source}
                      </span>
                    </td>
                    {/* <td className="p-4">
                      <Badge variant="secondary">{lead.stage}</Badge>
                    </td> */}
                    <td className="p-4">
                      <Badge variant="secondary">{lead.tag}</Badge>
                    </td>
                    {/* <td className="p-4 font-semibold text-foreground">
                      {lead.value}
                    </td> */}
                    <td className="p-4">
                      <Select
                        value={lead.status}
                        onValueChange={(newStatus: string) =>
                          handleUpdateLead(lead.id, { status: newStatus })
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-sm bg-background border-border text-foreground">
                          <SelectValue placeholder="Status" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-800 bg-black text-white">
                          <SelectGroup>
                            {/* <SelectLabel>Lead Status</SelectLabel> */}
                            <SelectItem value="PENDING" className="text-white">Pending</SelectItem>
                            <SelectItem value="FOLLOW_UP" className="text-white">Follow Up</SelectItem>
                            <SelectItem value="CONVERTED" className="text-white">Converted</SelectItem>
                            <SelectItem value="REJECTED" className="text-white">Rejected</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 min-w-[100px]">
                      <div className="text-xs text-muted-foreground">
                        {new Date(lead.leadsCreatedDate || lead.createdAt || lead.created || new Date()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 min-w-[100px]">
                      <div className="text-xs text-muted-foreground">
                        {lead.leadsUpdatedDates ? new Date(lead.leadsUpdatedDates).toLocaleDateString() : (lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : '-')}
                      </div>
                    </td>
                    <td className="p-4 min-w-[100px]">
                      <div className="text-xs text-muted-foreground">
                        {lead.enquiryDate ? new Date(lead.enquiryDate).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="p-4 min-w-[100px]">
                      <div className="text-xs text-muted-foreground">
                        {lead.bookingDate ? new Date(lead.bookingDate).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="p-4 min-w-[100px]">
                      <div className="text-xs text-muted-foreground">
                        {lead.checkInDates ? new Date(lead.checkInDates).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="p-4 flex gap-1 sticky right-0 bg-background border-l border-border">
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
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400"
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

      {popup === "view" && selectedLead && (
        <LeadViewModal lead={selectedLead} closePopup={closePopup} />
      )}
      {popup === "edit" && selectedLead && (
        <LeadsEditModal
          leadId={selectedLead.id}
          onClose={closePopup}
          onLeadUpdated={fetchLeads}
        />
      )}
    </div>
  );
}
