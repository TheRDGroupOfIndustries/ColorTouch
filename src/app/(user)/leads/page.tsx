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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stats = [
  {
    title: "Total Leads",
    value: "1,247",
    change: "+12%",
    icon: Users,
    color: "bg-info",
  },
  {
    title: "New This Week",
    value: "89",
    change: "+8%",
    icon: UserPlus,
    color: "bg-info",
  },
  {
    title: "Converted",
    value: "342",
    change: "+15%",
    icon: CheckCircle,
    color: "bg-success",
  },
  {
    title: "Hot Leads",
    value: "156",
    label: "Hot",
    icon: Flame,
    color: "bg-warning",
  },
];

const leads = [
  {
    name: "Rajesh Kumar",
    company: "Tech Solutions Pvt Ltd",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    source: "Facebook",
    stage: "new",
    tag: "hot",
    value: "₹150,000",
    created: "2024-01-15",
    avatar: "RK",
  },
  {
    name: "Priya Sharma",
    company: "Digital Marketing Agency",
    email: "priya.sharma@company.com",
    phone: "+91 87654 32109",
    source: "Google",
    stage: "contacted",
    tag: "warm",
    value: "₹75,000",
    created: "2024-01-14",
    avatar: "PS",
  },
  {
    name: "Amit Patel",
    company: "StartupXYZ",
    email: "amit.patel@startup.in",
    phone: "+91 76543 21098",
    source: "Website",
    stage: "in progress",
    tag: "qualified",
    value: "₹200,000",
    created: "2024-01-13",
    avatar: "AP",
  },
  {
    name: "Sneha Gupta",
    company: "Retail Chain Ltd",
    email: "sneha.gupta@retail.com",
    phone: "+91 65432 10987",
    source: "Referral",
    stage: "converted",
    tag: "qualified",
    value: "₹300,000",
    created: "2024-01-12",
    avatar: "SG",
  },
  {
    name: "Vikram Singh",
    company: "Manufacturing Corp",
    email: "vikram.singh@manufacturing.in",
    phone: "+91 54321 09876",
    source: "Instagram",
    stage: "lost",
    tag: "cold",
    value: "₹50,000",
    created: "2024-01-11",
    avatar: "VS",
  },
  {
    name: "Kavya Reddy",
    company: "Healthcare Solutions",
    email: "kavya.reddy@healthcare.org",
    phone: "+91 43210 98765",
    source: "Facebook",
    stage: "new",
    tag: "warm",
    value: "₹180,000",
    created: "2024-01-10",
    avatar: "KR",
  },
  {
    name: "Arjun Mehta",
    company: "FinTech Innovations",
    email: "arjun.mehta@fintech.com",
    phone: "+91 32109 87654",
    source: "Google",
    stage: "contacted",
    tag: "hot",
    value: "₹250,000",
    created: "2024-01-09",
    avatar: "AM",
  },
];

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
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="p-6 space-y-6">
        {/* Header */}
        {/* <div>
             <h1 className="text-3xl font-bold text-foreground mb-1">Lead Management</h1>
             <p className="text-muted-foreground">Welcome back, manage your leads and campaigns</p>
           </div> */}

        {/* Page Header */}
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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
              className="pl-10 bg-card border-border"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="website">Website</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Leads (12)
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

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
                {leads.map((lead) => (
                  <tr
                    key={lead.email}
                    className="border-b border-border hover:bg-secondary/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-info">
                          <AvatarFallback className="bg-info text-white font-semibold">
                            {lead.avatar}
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
                    <td className="p-4">
                      <span className="font-semibold text-foreground">
                        {lead.value}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {lead.created}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-info hover:text-info hover:bg-info/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-warning hover:text-warning hover:bg-warning/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
