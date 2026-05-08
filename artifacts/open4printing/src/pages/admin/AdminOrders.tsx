import { useState } from "react";
import { Link } from "wouter";
import { useListAdminOrders } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { StatusPill } from "./AdminDashboard";
import { Input } from "@/components/ui/input";

export default function AdminOrders() {
  return (
    <AdminLayout>
      <Inner />
    </AdminLayout>
  );
}

function Inner() {
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const { data, isLoading } = useListAdminOrders({
    search: search || undefined,
    orderStatus: orderStatus || undefined,
    paymentStatus: paymentStatus || undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-black">Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input placeholder="Search by # or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["new","awaiting_artwork_review","in_production","ready_for_pickup","shipped","completed","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All payment statuses</option>
          {["pending_payment","paid","failed","refunded","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {data?.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No orders found.</td></tr>}
            {data?.map((o) => (
              <tr key={o.id} className="hover:bg-muted/20">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono font-bold text-primary hover:underline">#{o.orderNumber}</Link></td>
                <td className="px-4 py-3">{o.firstName} {o.lastName}<br /><span className="text-muted-foreground text-xs">{o.email}</span></td>
                <td className="px-4 py-3">{o.itemCount}</td>
                <td className="px-4 py-3 font-bold">${o.total.toFixed(2)}</td>
                <td className="px-4 py-3"><StatusPill kind="payment" status={o.paymentStatus} /></td>
                <td className="px-4 py-3"><StatusPill kind="order" status={o.orderStatus} /></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
