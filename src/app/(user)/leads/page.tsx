"use client";

import {
  Search,
  Plus,
  Upload,
  Download,
  Filter,
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
import  toast , { Toaster } from "react-hot-toast";

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
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [popup, setPopup] = useState<null | "add" | "view" | "edit" | "delete">(
    null
  );
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null); // State for the selected lead
  const closePopup = () => setPopup(null);

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'created'>): Promise<void> => {
     console.log("Simulating add new lead with data:", newLeadData);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

     const newLead: Lead = {
      ...newLeadData,
      id: Date.now().toString(),  
      created: new Date().toLocaleDateString(),
       stage: newLeadData.stage || "new",
      tag: newLeadData.tag || "cold",
      value: newLeadData.value || "$0.00",
    };

     setLeads((prevLeads) => [newLead, ...prevLeads]);

     closePopup();
    console.log("Lead added successfully:", newLead);
  };
  const handleUpdateLead = async (
    leadId: string,
    data: Partial<Lead>
  ): Promise<void> => {
    // 1. Simulate API Call (Replace with real fetch if needed)
    console.log(`Simulating update for lead ${leadId} with data:`, data);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    // 2. Update local state
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? ({ ...lead, ...data } as Lead) : lead
      )
    );
    // In a real app, you would show a success toast here
  };

  // const handleDeleteLead = async (leadId: string): Promise<void> => {
  //   // 1. Simulate API Call (Replace with real fetch if needed)
  //   console.log(`Simulating delete for lead ${leadId}`);
  //   await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  //   // 2. Update local state
  //   setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
  //   // In a real app, you would show a success toast here
  // };

  const handleDeleteLead = async (leadId: string): Promise<void> => {
  try {
    toast.loading("Deleting lead...");

    const res = await fetch(`/api/leads/${leadId}`, {
      method: "DELETE",
    });

    const data = await res.json();
    toast.dismiss();

    if (!res.ok) {
      toast.error(`❌ Failed to delete: ${data.error || "Unknown error"}`);
      return;
    }

    // ✅ Update local state
    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));

    toast.success("🗑️ Lead deleted successfully!");
  } catch (error) {
    console.error("Error deleting lead:", error);
    toast.dismiss();
    toast.error("Something went wrong while deleting the lead");
  }
};


  const openModal = (
    action: "add" | "view" | "edit" | "delete",
    lead: Lead | null
  ) => {
    setSelectedLead(lead);
    setPopup(action);
  };
  // Fetch leads from API
  useEffect(() => {
    setLoading(true);
    fetch("/api/leads")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
        else if (Array.isArray(data.leads)) setLeads(data.leads);
        else setLeads([]);
      })
      .catch((err) => setError(err.message || "Failed to fetch leads"))
      .finally(() => setLoading(false));
  }, []);

  // Derived statistics
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
        change: "",
        icon: Users,
        color: "bg-info",
      },
      {
        title: "New This Week",
        value: newThisWeek.toString(),
        change: "",
        icon: UserPlus,
        color: "bg-info",
      },
      {
        title: "Converted",
        value: "—",
        change: "+0%",
        icon: CheckCircle,
        color: "bg-success",
      },
      {
        title: "Hot Leads",
        value: hotLeads.toString(),
        label: "Hot",
        icon: Flame,
        color: "bg-warning",
      },
    ];
  }, [leads]);

  // Filter + Search logic
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

  return (
    <div className="p-6 space-y-6">
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
            onClick={() => openModal("add", null)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <div className="flex items-center gap-2">
                  {stat.change && (
                    <span className="text-sm font-medium text-success">
                      {stat.change}
                    </span>
                  )}
                  {stat.label && (
                    <span className="text-sm font-medium text-warning">
                      {stat.label}
                    </span>
                  )}
                </div>
              </div>
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

        {/* <Select onValueChange={setSelectedStage}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Filter by Stage" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="in progress">In Progress</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select> */}

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

      {/* Leads Table */}
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
            {/* <Button variant="outline" size="sm" className="border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button> */}
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Lead
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Contact
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Stage
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Tag
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Value
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
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
                            {lead.avatar ||
                              lead.name
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
                      <div className="text-sm text-foreground">
                        {lead.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getSourceIcon(lead.source)}
                        </span>
                        <span className="text-sm text-foreground">
                          {lead.source}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={
                          lead.stage === "new"
                            ? "bg-info/20 text-info"
                            : lead.stage === "contacted"
                            ? "bg-warning/20 text-warning"
                            : lead.stage === "in progress"
                            ? "bg-primary/20 text-primary"
                            : lead.stage === "converted"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        }
                      >
                        {lead.stage}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={
                          lead.tag === "hot"
                            ? "bg-destructive/20 text-destructive"
                            : lead.tag === "warm"
                            ? "bg-warning/20 text-warning"
                            : lead.tag === "qualified"
                            ? "bg-success/20 text-success"
                            : "bg-info/20 text-info"
                        }
                      >
                        {lead.tag}
                      </Badge>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {lead.value}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {lead.created}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 cursor-pointer w-8 p-0 text-info hover:text-info hover:bg-info/10"
                          onClick={() => openModal("view", lead)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer text-warning hover:text-warning hover:bg-warning/10"
                          onClick={() => openModal("edit", lead)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openModal("delete", lead)}
                        >
                          <Trash className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <LeadsModal
          popup={popup}
          lead={selectedLead}
          closePopup={closePopup}
          onUpdateLead={handleUpdateLead}
          onAddLead={handleAddLead}
          onDeleteLead={handleDeleteLead}
        />
      </Card>
    </div>
  );
}
