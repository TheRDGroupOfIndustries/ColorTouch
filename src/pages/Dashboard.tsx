import { TrendingUp, TrendingDown, DollarSign, UserPlus, Users as UsersIcon, TrendingUp as ChartIcon, Calendar, Plus, Eye, Edit, CheckCircle, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AuthButton from "@/components/AuthButton";

const stats = [
  {
    title: "Total Revenue",
    value: "₹1,250.00",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    subtitle: "Trending up this month",
  },
  {
    title: "New Leads",
    value: "1,234",
    change: "-20%",
    trend: "down",
    icon: UserPlus,
    subtitle: "Down 20% this period",
  },
  {
    title: "Active Employees",
    value: "45,678",
    change: "+12.5%",
    trend: "up",
    icon: UsersIcon,
    subtitle: "Strong user retention",
  },
  {
    title: "Conversion Rate",
    value: "4.5%",
    change: "+4.5%",
    trend: "up",
    icon: ChartIcon,
    subtitle: "Steady performance increase",
  },
];

const leads = [
  { name: "Sarah Johnson", company: "Tech Solutions Inc", amount: "₹2,500", status: "New", avatar: "SJ", color: "bg-info" },
  { name: "Michael Chen", company: "Digital Marketing Pro", amount: "₹1,800", status: "Contacted", avatar: "MC", color: "bg-info" },
  { name: "Emily Davis", company: "Creative Agency", amount: "₹3,200", status: "In-Progress", avatar: "ED", color: "bg-info" },
  { name: "David Wilson", company: "E-commerce Store", amount: "₹4,100", status: "Qualified", avatar: "DW", color: "bg-info" },
  { name: "Lisa Anderson", company: "Consulting Firm", amount: "₹2,900", status: "New", avatar: "LA", color: "bg-info" },
];

const campaigns = [
  {
    name: "Summer Sale Campaign",
    status: "Active",
    sent: 1250,
    delivered: 1180,
    opened: 890,
    replied: 156,
  },
  {
    name: "Product Launch",
    status: "Completed",
    sent: 980,
    delivered: 945,
    opened: 720,
    replied: 98,
  },
  {
    name: "Follow-up Sequence",
    status: "Active",
    sent: 2100,
    delivered: 2050,
    opened: 1560,
    replied: 234,
  },
];

const reminders = [
  { name: "Rajesh Kumar", company: "Digital Solutions", type: "Call", time: "2:00 PM Today", color: "bg-red-900" },
  { name: "Priya Sharma", company: "Tech Startup", type: "Email", time: "Tomorrow 10 AM", color: "bg-yellow-900" },
  { name: "Amit Singh", company: "E-commerce Co", type: "Meeting", time: "Friday 3 PM", color: "bg-red-900" },
  { name: "Neha Gupta", company: "Marketing Agency", type: "Follow-up", time: "Next Monday", color: "bg-green-900" },
];

const notes = [
  { name: "Sarah Johnson", note: "Interested in premium package, needs pricing details", time: "2 hours ago", avatar: "AP", color: "bg-primary" },
  { name: "Michael Chen", note: "Requested demo for next week, sent calendar link", time: "4 hours ago", avatar: "AP", color: "bg-primary" },
  { name: "Emily Davis", note: "Budget approved, ready to proceed with proposal", time: "1 day ago", avatar: "AP", color: "bg-primary" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div>
          <AuthButton />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, manage your leads and campaigns</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <div className="flex items-center gap-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </Card>
        ))}
      </div>

      {/* Chart and Ad Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* <Card className="lg:col-span-2 p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Leads To Follow-Up With</h2>
              <p className="text-sm text-muted-foreground">Follow-up schedule for the last 3 months</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Last 7 days</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Last 30 days</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Last 3 months</Button>
            </div>
          </div>

          Chart
          <div className="relative h-64 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              <path
                d="M 0 150 Q 100 120, 200 100 T 400 80 T 600 60 T 800 40"
                fill="none"
                stroke="hsl(var(--chart))"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(0,204,255,0.5)]"
              />
              <circle cx="100" cy="120" r="4" fill="hsl(var(--chart))" />
              <circle cx="200" cy="100" r="4" fill="hsl(var(--chart))" />
              <circle cx="300" cy="90" r="4" fill="hsl(var(--chart))" />
              <circle cx="400" cy="80" r="4" fill="hsl(var(--chart))" />
              <circle cx="500" cy="70" r="4" fill="hsl(var(--chart))" />
              <circle cx="600" cy="60" r="4" fill="hsl(var(--chart))" />
              <circle cx="700" cy="50" r="4" fill="hsl(var(--chart))" />
            </svg>
          </div>

          Legend
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-info"></div>
                <span className="text-sm text-foreground font-medium">Urgent</span>
                <span className="text-sm text-muted-foreground">8</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-sm text-foreground font-medium">This Week</span>
                <span className="text-sm text-muted-foreground">15</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart"></div>
                <span className="text-sm text-foreground font-medium">Next Week</span>
                <span className="text-sm text-muted-foreground">12</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="rounded-full">3</Badge>
                <span className="text-sm text-foreground font-medium">Overdue</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          </div>
        </Card> */}

        
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads To Follow-Up With */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Leads To Follow-Up With</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Follow-up
            </Button>
          </div>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className={`w-10 h-10 ${lead.color}`}>
                    <AvatarFallback className={`${lead.color} text-white font-semibold`}>
                      {lead.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{lead.amount}</div>
                    <Badge
                      variant="secondary"
                      className={
                        lead.status === "New"
                          ? "bg-info/20 text-info"
                          : lead.status === "Contacted"
                          ? "bg-warning/20 text-warning"
                          : lead.status === "In-Progress"
                          ? "bg-warning/20 text-warning"
                          : "bg-success/20 text-success"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

         {/* Upcoming Reminders */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Reminders</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-primary">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${reminder.color} flex items-center justify-center`}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{reminder.name}</div>
                    <div className="text-sm text-muted-foreground">{reminder.company}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-primary/20 text-primary mb-1">
                    {reminder.type}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{reminder.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        
      </div>

      {/* Reminders and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
{/* Campaign Performance */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Campaign Performance</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </div>
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <div key={campaign.name}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-foreground">{campaign.name}</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      campaign.status === "Active"
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{campaign.sent}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-info">{campaign.delivered}</div>
                    <div className="text-xs text-muted-foreground">Delivered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-chart">{campaign.opened}</div>
                    <div className="text-xs text-muted-foreground">Opened</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{campaign.replied}</div>
                    <div className="text-xs text-muted-foreground">Replied</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Ad Section */}
        <Card className="p-6 bg-card border-border flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-4">
            <Image className="w-8 h-8 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            Upgrade to go ad-free <Edit className="w-4 h-4 text-destructive" />
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Remove ads and unlock premium features with SkyTouch Pro
          </p>
          <div className="w-full p-6 mb-4 bg-secondary rounded-lg border border-border">
            <div className="text-xs text-muted-foreground mb-2">Sample Ad Space</div>
            <div className="text-sm font-medium text-primary">Your Ad Will Display Here</div>
            <div className="text-xs text-muted-foreground">XYZ Features Of Ads</div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Pro Version
          </Button>
        </Card>
      </div>
    </div>
  );
}
