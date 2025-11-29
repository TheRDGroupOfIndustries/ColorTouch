"use client";

import { ReactNode, useEffect, useState } from "react";
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
  CreditCard,
  User,
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
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Employees", href: "/employees", icon: UsersRound },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Integrations", href: "/integrations", icon: LinkIcon },
  { name: "Automation", href: "/automation", icon: Microchip },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Subscription state (fetch from server to get latest value after payment updates)
  const [subscription, setSubscription] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = session?.user as any;
        if (!user || !user.id) return;
        const res = await fetch(`/api/auth/user/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        console.debug("Fetched subscription for user:", user.id, data.subscription);
        setSubscription(data.subscription || null);
      } catch (err) {
        console.error("Failed to fetch user subscription:", err);
      }
    };

    fetchSubscription();
  }, [session]);
  // If user is an EMPLOYEE and not PREMIUM, show only Payments link
  // Only show the Payments-only sidebar once we have the subscription state
  if (session?.user?.role === "EMPLOYEE" && subscription !== null && subscription !== "PREMIUM") {
    const paymentsOnly = navigation.filter((item) => item.name === "Payments");
    return (
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar */}
        <aside className="w-60 bg-sidebar border-r border-border flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">ColorTouch CRM</h1>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {paymentsOnly.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <AuthButton />
          </nav>

          <div className="p-4 m-3 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Cloud className="w-5 h-5" />
              <span className="font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Unlock automation & go ad-free</p>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get ColorTouch Pro</Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
            <div />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 bg-[#262626]">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{(session?.user?.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">{session?.user?.name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{session?.user?.role || "Guest"}</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    );
  }

  const visibleNav = navigation.filter((item) => {
    // Employees page only for admins
    if (item.name === "Employees") {
      return session?.user?.role === "ADMIN";
    }

    // Payments page should be visible only to EMPLOYEE role
    if (item.name === "Payments") {
      return session?.user?.role === "EMPLOYEE";
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
            Get ColorTouch Pro 
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
