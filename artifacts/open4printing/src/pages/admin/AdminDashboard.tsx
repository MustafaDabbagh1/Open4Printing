import { Link } from "wouter";
import { useGetAdminDashboardStats } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { ShoppingBag, DollarSign, Clock, CheckCircle2, Package, AlertCircle, FileSearch, Eye, MessageSquare } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  awaiting_artwork_review: "Awaiting artwork review",
  proof_needed: "Proof needed",
  proof_sent: "Proof sent",
  proof_approved: "Proof approved",
  in_production: "In production",
  ready_for_pickup: "Ready for pickup",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};
const PAYMENT_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  pending_authorize_net_connection: "Awaiting Authorize.net connection",
  test_paid: "Test paid (demo)",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Inner />
    </AdminLayout>
  );
}

function Inner() {
  const { data, isLoading } = useGetAdminDashboardStats();
  if (isLoading || !data) return <div>Loading…</div>;

  const stats = [
    { label: "Total orders", value: data.totalOrders, icon: ShoppingBag },
    { label: "Revenue (paid)", value: `$${data.totalRevenue.toFixed(2)}`, icon: DollarSign },
    { label: "New", value: data.newOrders, icon: AlertCircle },
    { label: "Awaiting artwork review", value: data.awaitingArtworkReviewOrders, icon: FileSearch },
    { label: "Proof pending", value: data.proofPendingOrders, icon: Eye },
    { label: "Pending payment", value: data.pendingPaymentOrders, icon: Clock },
    { label: "Paid", value: data.paidOrders, icon: CheckCircle2 },
    { label: "In production", value: data.inProductionOrders, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-serif font-black">Dashboard</h1>
        <Link href="/admin/quotes" className="text-sm text-primary hover:underline inline-flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Quote requests</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <s.icon className="w-4 h-4" /> {s.label}
            </div>
            <div className="text-3xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {data.recentOrders.length === 0 && <div className="p-6 text-muted-foreground text-sm">No orders yet.</div>}
          {data.recentOrders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold">#{o.orderNumber}</div>
                  <div className="text-sm text-muted-foreground truncate">{o.firstName} {o.lastName} • {o.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold">${o.total.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    <StatusPill kind="payment" status={o.paymentStatus} /> <StatusPill kind="order" status={o.orderStatus} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ status, kind }: { status: string; kind: "order" | "payment" }) {
  const label = kind === "order" ? STATUS_LABELS[status] ?? status : PAYMENT_LABELS[status] ?? status;
  const color =
    status === "paid" || status === "test_paid" || status === "completed" || status === "shipped" || status === "proof_approved"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
      : status === "failed" || status === "cancelled"
        ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300"
        : status === "pending_payment" || status === "pending_authorize_net_connection" || status === "new" || status === "awaiting_artwork_review" || status === "proof_needed" || status === "proof_sent"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
          : "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300";
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
}
