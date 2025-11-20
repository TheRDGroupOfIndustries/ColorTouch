"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Cloud,
  LayoutDashboard,
  Users,
  MessageCircle,
  Calendar,
  FileText,
  UsersRound,
  Link as LinkIcon,
  Settings,
  Microchip,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import AuthButton from "./AuthButton";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Lead Management", href: "/leads", icon: Users },
  { name: "WhatsApp Campaigns", href: "/whatsapp", icon: MessageCircle },
  { name: "Leads Follow-Up", href: "/follow-up", icon: Calendar },
  { name: "Invoice & Payment", href: "/invoices", icon: FileText },
  { name: "Employees", href: "/employees", icon: UsersRound },
  { name: "Integrations", href: "/integrations", icon: LinkIcon },
  { name: "Automation", href: "/automation", icon: Microchip },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
 const { data: session } = useSession();

  // Hide certain links from non-admin users (e.g., Employees page)
  const visibleNav = navigation.filter((item) => {
    if (item.name === "Employees") {
      return session?.user?.role === "ADMIN";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Cloud className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">ColorTouch CRM</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#262626] text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <AuthButton />
        </nav>

        {/* Upgrade Section */}
        <div className="p-4 m-3 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Cloud className="w-5 h-5" />
            <span className="font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock automation & go ad-free
          </p>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Get SkyTouch Pro 
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search leads, campaigns..."
              className="pl-10 bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* <button className="relative p-2 hover:bg-card rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button> */}

            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 bg-[#262626]">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-semibold text-foreground">{session?.user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground">{session?.user?.role || "Guest"}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
