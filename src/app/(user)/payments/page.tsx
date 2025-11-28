import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import RazorpayPayment from "@/components/ui/RazorpayPayment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Shield, Zap } from "lucide-react";

export default async function PaymentPage() {
  // Server-side: get session and user
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-muted-foreground">Please sign in to access payments.</p>
      </div>
    );
  }

  const userId = session.user.id as string;
  const userRole = session.user.role as string;

  // Payments UI only for EMPLOYEE role
  if (userRole !== "EMPLOYEE") {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold">Not available</h1>
        <p className="mt-2 text-muted-foreground">Payments are only available to employees.</p>
        <div className="mt-4">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch user subscription status
  let user: { subscription: string | null } | null = null;
  try {
    user = await prisma.user.findUnique({ where: { id: userId }, select: { subscription: true } });
  } catch (err) {
    console.error("Failed to fetch user subscription:", err);
  }

  const isPremium = user?.subscription === "PREMIUM";

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Hero */}
      <div className="mb-8 rounded-2xl border border-border bg-card/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Unlock Premium</h1>
            <p className="mt-2 text-sm text-muted-foreground">One simple payment to enable automation, advanced analytics, and priority support.</p>
          </div>
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm font-medium">Automation Suite</div>
              <div className="text-xs text-muted-foreground">Bulk messaging, smart follow-ups, campaign workflows</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <div>
              <div className="text-sm font-medium">Real-time Insights</div>
              <div className="text-xs text-muted-foreground">Conversion metrics & performance dashboards</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Priority Support</div>
              <div className="text-xs text-muted-foreground">Fast help for your team when you need it</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout - Payment & Benefits */}
      <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
        
        {/* Payment Column */}
        <div>
          {!isPremium ? (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card/50 to-card shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">Complete Your Upgrade</CardTitle>
                <CardDescription className="text-base">Secure payment with Razorpay. Instant activation.</CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="bg-background/50 rounded-xl p-6 border border-border/50">
                  <RazorpayPayment description="Upgrade to ColorTouch CRM Premium" buttonText="Pay & Activate" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50/5 to-card shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-green-600">Premium Active</CardTitle>
                <CardDescription className="text-base">You're all set—enjoy full access.</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="flex items-center justify-center gap-3 text-green-600 mb-6">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-lg font-semibold">Subscription: PREMIUM</span>
                </div>
                <Link href="/dashboard">
                  <Button size="lg" className="px-8">Continue to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Benefits Column */}
        <div>
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold">What's Included</CardTitle>
              <CardDescription className="text-base">Everything you need to supercharge your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-background/30">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Unlimited Campaigns</h3>
                    <p className="text-sm text-muted-foreground">Create unlimited messaging campaigns with scheduling and advanced templates</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-background/30">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground">Deep lead tracking, conversion metrics, and performance dashboards</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-background/30">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Priority Support</h3>
                    <p className="text-sm text-muted-foreground">Get priority help and faster issue resolution for your team</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Secure payment processed by Razorpay • No card details stored</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}