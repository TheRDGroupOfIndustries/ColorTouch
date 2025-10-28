import { Search, Plus, Upload, Download, Filter, Eye, Edit, Trash, Users, UserPlus, CheckCircle, Flame } from "lucide-react";
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

const stats = [
  { title: "Total Leads", value: "1,247", change: "+12%", icon: Users, color: "bg-info" },
  { title: "New This Week", value: "89", change: "+8%", icon: UserPlus, color: "bg-info" },
  { title: "Converted", value: "342", change: "+15%", icon: CheckCircle, color: "bg-success" },
  { title: "Hot Leads", value: "156", label: "Hot", icon: Flame, color: "bg-warning" },
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
  return (
    <div className="p-6">
     <div className="p-6 space-y-6">
           {/* Header */}
           <div>
             <h1 className="text-3xl font-bold text-foreground mb-1">Lead Management</h1>
             <p className="text-muted-foreground">Welcome back, manage your leads and campaigns</p>
           </div>
     
           {/* Page Header */}
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold text-foreground">Lead Management</h2>
               <p className="text-sm text-muted-foreground">Manage and track your leads efficiently</p>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
                 </svg>
                 Import from Meta
               </Button>
               <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
                 Import from Google
               </Button>
               <Button variant="outline" className="border-success text-success hover:bg-success/10">
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
                     <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                     <div className="flex items-center gap-2">
                       {stat.change && (
                         <span className="text-sm font-medium text-success">{stat.change}</span>
                       )}
                       {stat.label && (
                         <span className="text-sm font-medium text-warning">{stat.label}</span>
                       )}
                     </div>
                   </div>
                   <div className={`w-12 h-12 rounded-xl ${stat.color}/20 flex items-center justify-center`}>
                     <stat.icon className={`w-6 h-6 ${stat.color === "bg-info" ? "text-info" : stat.color === "bg-success" ? "text-success" : "text-warning"}`} />
                   </div>
                 </div>
                 <div className="text-3xl font-bold text-foreground">{stat.value}</div>
               </Card>
             ))}
           </div>
     
           {/* Filters */}
           <div className="flex items-center gap-4">
             <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
               <Input placeholder="Search leads..." className="pl-10 bg-card border-border" />
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
               <h3 className="text-lg font-semibold text-foreground">Leads (12)</h3>
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
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Lead</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stage</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tag</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Value</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {leads.map((lead) => (
                     <tr key={lead.email} className="border-b border-border hover:bg-secondary/50">
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                           <Avatar className="w-10 h-10 bg-info">
                             <AvatarFallback className="bg-info text-white font-semibold">
                               {lead.avatar}
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <div className="font-medium text-foreground">{lead.name}</div>
                             <div className="text-sm text-muted-foreground">{lead.company}</div>
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <div className="text-sm text-foreground">{lead.email}</div>
                         <div className="text-sm text-muted-foreground">{lead.phone}</div>
                       </td>
                       <td className="p-4">
                         <div className="flex items-center gap-2">
                           <span className="text-lg">{getSourceIcon(lead.source)}</span>
                           <span className="text-sm text-foreground">{lead.source}</span>
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
                         <span className="font-semibold text-foreground">{lead.value}</span>
                       </td>
                       <td className="p-4">
                         <span className="text-sm text-muted-foreground">{lead.created}</span>
                       </td>
                       <td className="p-4">
                         <div className="flex gap-1">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-info hover:text-info hover:bg-info/10">
                             <Eye className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-warning hover:text-warning hover:bg-warning/10">
                             <Edit className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
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
