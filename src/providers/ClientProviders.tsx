"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import { SessionProvider, useSession } from "next-auth/react";
import LoginPage from "@/app/login/page"; // import your login page component

const queryClient = new QueryClient();

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Optionally, show a loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If no session, show login page
  if (!session) {
    return <LoginPage />;
  }

  // If session exists, show the app wrapped in Layout
  return <Layout>{children}</Layout>;
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthWrapper>{children}</AuthWrapper>
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
