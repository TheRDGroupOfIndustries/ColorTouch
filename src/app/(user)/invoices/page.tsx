"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Receipt,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receipt?: string;
  paymentMethod?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchPayments();
    }
  }, [session]);

  // Calculate stats
  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "COMPLETED").length,
    pending: payments.filter((p) => p.status === "PENDING").length,
    failed: payments.filter((p) => p.status === "FAILED").length,
    totalAmount: payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + Number(p.amount), 0),
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.receipt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500/30 border-2 border-green-400/50 text-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-500/30 border-2 border-yellow-400/50 text-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-500/30 border-2 border-red-400/50 text-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-purple-500/30 border-2 border-purple-400/50 text-purple-100">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/30 border-2 border-gray-400/50 text-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const handleDownloadInvoice = (payment: Payment) => {
    // Create a simple invoice download
    const invoiceContent = `
INVOICE
=======

Invoice Number: INV-${payment.orderId}
Date: ${formatDate(payment.createdAt)}
${payment.paidAt ? `Payment Date: ${formatDate(payment.paidAt)}` : ""}

Customer: ${session?.user?.name || "N/A"}
Email: ${session?.user?.email || "N/A"}

-------------------------------------------
Description                     Amount
-------------------------------------------
Premium Subscription            ${formatCurrency(Number(payment.amount), payment.currency)}
-------------------------------------------
Total:                          ${formatCurrency(Number(payment.amount), payment.currency)}
-------------------------------------------

Payment Status: ${payment.status}
${payment.razorpayPaymentId ? `Transaction ID: ${payment.razorpayPaymentId}` : ""}
${payment.paymentMethod ? `Payment Method: ${payment.paymentMethod}` : ""}

Thank you for your business!
ColorTouch CRM
    `.trim();

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${payment.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-black/80 border border-white/10 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your invoices.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
              <Receipt className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Invoices & Billing</h1>
          </div>
          <p className="text-gray-400 mt-2">
            View and manage your payment history and invoices
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/80 border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20 border border-blue-400/30">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20 border border-green-400/30">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.completed}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/20 border border-yellow-400/30">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-black/80 border border-white/10 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, transaction ID, or receipt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-black/40 border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-black/80 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment History
            </CardTitle>
            <CardDescription className="text-gray-400">
              All your transactions and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
                <p className="text-gray-400">
                  {payments.length === 0
                    ? "You haven't made any payments yet."
                    : "No invoices match your search criteria."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Invoice</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Method</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                              <FileText className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                INV-{payment.orderId.slice(0, 8).toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.razorpayPaymentId || "Processing..."}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-300">
                              {formatDate(payment.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="font-semibold text-white">
                              {formatCurrency(Number(payment.amount), payment.currency)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(payment.status)}</td>
                        <td className="p-4">
                          <span className="text-sm text-gray-400">
                            {payment.paymentMethod || "Razorpay"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white hover:bg-white/10"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payment.status === "COMPLETED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={() => handleDownloadInvoice(payment)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="bg-black border border-gray-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Invoice Details
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete transaction information
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6 mt-4">
                {/* Invoice Header */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400">Invoice Number</p>
                    <p className="text-lg font-semibold text-white">
                      INV-{selectedPayment.orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  {getStatusBadge(selectedPayment.status)}
                </div>

                {/* Amount */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-400/20">
                  <p className="text-sm text-gray-400 mb-1">Amount</p>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(Number(selectedPayment.amount), selectedPayment.currency)}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm text-white">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  {selectedPayment.paidAt && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-500">Paid At</p>
                      <p className="text-sm text-white">{formatDate(selectedPayment.paidAt)}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm text-white">
                      {selectedPayment.paymentMethod || "Razorpay"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500">Currency</p>
                    <p className="text-sm text-white">{selectedPayment.currency}</p>
                  </div>
                </div>

                {/* Transaction IDs */}
                {(selectedPayment.razorpayOrderId || selectedPayment.razorpayPaymentId) && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-300">Transaction Details</p>
                    {selectedPayment.razorpayOrderId && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-gray-500">Razorpay Order ID</p>
                        <p className="text-sm text-white font-mono break-all">
                          {selectedPayment.razorpayOrderId}
                        </p>
                      </div>
                    )}
                    {selectedPayment.razorpayPaymentId && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-gray-500">Transaction ID</p>
                        <p className="text-sm text-white font-mono break-all">
                          {selectedPayment.razorpayPaymentId}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Failure Reason */}
                {selectedPayment.status === "FAILED" && selectedPayment.failureReason && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/20">
                    <p className="text-sm text-red-400 font-medium mb-1">Failure Reason</p>
                    <p className="text-sm text-red-300">{selectedPayment.failureReason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  {selectedPayment.status === "COMPLETED" && (
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleDownloadInvoice(selectedPayment)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}