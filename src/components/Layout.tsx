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
  FileText,
  UsersRound,
  Link as LinkIcon,
  Settings,
  Microchip,
  CreditCard,
  User,
  Menu,
  ChevronLeft,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import AuthButton from "./AuthButton";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Lead Management", href: "/leads", icon: Users },
  { name: "WhatsApp Campaigns", href: "/whatsapp", icon: MessageCircle },
  { name: "Leads Follow-Up", href: "/follow-up", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Employees", href: "/employees", icon: UsersRound },
  { name: "Integrations", href: "/integrations", icon: LinkIcon },
  { name: "Automation", href: "/automation", icon: Microchip },
];

interface UserDropdownProps {
  session: any;
}

function UserDropdown({ session }: UserDropdownProps) {
  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-sidebar-accent/50 h-auto p-2">
          <Avatar className="w-7 h-7 bg-[#262626]">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
              {(session?.user?.name?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs text-left">
            <div className="font-medium text-foreground">{session?.user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</div>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-black border-gray-800 shadow-lg">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer hover:bg-gray-900 text-white">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer hover:bg-gray-900 text-white">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-gray-900 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Subscription state (fetch from server to get latest value after payment updates)
  const [subscription, setSubscription] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const user = session?.user as any;
        if (!user || !user.id) return;
        
        // Skip API call for env-admin fallback (admin logged in via environment credentials)
        if (user.id === "env-admin") {
          // Admin users have full access, set PREMIUM subscription
          setSubscription("PREMIUM");
          return;
        }
        
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

          <main className="flex-1 overflow-hidden">{children}</main>
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
      {/* Gemini-style Sidebar - Smooth transitions */}
      <aside className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-border flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-72"
      }`}>
        {/* Header with ColorTouch symbol when expanded */}
        <div className={`p-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-0.5 bg-foreground rounded"></div>
                  <div className="w-6 h-0.5 bg-foreground rounded"></div>
                  <div className="w-6 h-0.5 bg-foreground rounded"></div>
                </div>
              </div>
              <h1 className="text-base font-bold text-foreground">ColorTouch CRM</h1>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 h-9 w-9 hover:bg-sidebar-accent/50 rounded-full transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Gemini-style Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1">
          {visibleNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out group ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                } ${
                  isCollapsed ? "justify-center w-12 h-12 mx-auto" : "mx-1"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className={`flex-shrink-0 transition-all duration-200 ${
                  isCollapsed ? "w-6 h-6" : "w-5 h-5"
                }`} />
                
                {!isCollapsed && (
                  <span className="transition-opacity duration-200">{item.name}</span>
                )}
                
                {/* Gemini-style Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Section - Only show when expanded, NOT premium, and NOT admin */}
        {!isCollapsed && subscription !== "PREMIUM" && session?.user?.role !== "ADMIN" && (
          <div className="p-4 m-3 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Cloud className="w-4 h-4" />
              <span className="font-medium text-sm">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock automation & go ad-free
            </p>
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
              Get ColorTouch Pro 
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content - Dynamic Offset based on Sidebar Width */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? "ml-16" : "ml-72"
      }`}>
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
            <UserDropdown session={session} />
          </div>
        </header>

        {/* Page Content */}
          <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
