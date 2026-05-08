import { useParams, Link } from "wouter";
import { useGetAdminOrder, useUpdateAdminOrder, getGetAdminOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { StatusPill } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { apiPath } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ORDER_STATUSES = ["new","awaiting_artwork_review","in_production","ready_for_pickup","shipped","completed","cancelled"];
const PAYMENT_STATUSES = ["pending_payment","paid","failed","refunded","cancelled"];

export default function AdminOrderDetail() {
  return (
    <AdminLayout>
      <Inner />
    </AdminLayout>
  );
}

function Inner() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useGetAdminOrder(orderId);
  const update = useUpdateAdminOrder();

  if (isLoading || !data) return <div>Loading…</div>;

  const handleUpdate = async (patch: { orderStatus?: string; paymentStatus?: string }) => {
    try {
      await update.mutateAsync({ id: orderId, data: patch });
      await queryClient.invalidateQueries({ queryKey: getGetAdminOrderQueryKey(orderId) });
      toast({ title: "Order updated" });
    } catch (err) {
      toast({ title: "Update failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All orders
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black font-mono">#{data.orderNumber}</h1>
          <p className="text-muted-foreground">{new Date(data.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black">${data.total.toFixed(2)}</div>
          <div className="space-x-1 mt-1">
            <StatusPill kind="payment" status={data.paymentStatus} />
            <StatusPill kind="order" status={data.orderStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Update payment status</div>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={data.paymentStatus} onChange={(e) => handleUpdate({ paymentStatus: e.target.value })}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Update order status</div>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={data.orderStatus} onChange={(e) => handleUpdate({ orderStatus: e.target.value })}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Customer</div>
          <div className="font-bold">{data.firstName} {data.lastName}</div>
          <div className="text-sm">{data.email}</div>
          {data.phone && <div className="text-sm">{data.phone}</div>}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Shipping</div>
          <AddressBlock address={data.shippingAddress} />
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Billing</div>
          <AddressBlock address={data.billingAddress} />
        </div>
        {data.notes && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes</div>
            <div className="text-sm whitespace-pre-wrap">{data.notes}</div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-bold">Items</div>
        <div className="divide-y divide-border">
          {data.items.map((it) => (
            <div key={it.id} className="px-6 py-4">
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold">{it.productName} <span className="font-mono text-xs text-muted-foreground">({it.productSlug})</span></div>
                  <div className="text-sm text-muted-foreground">Qty {it.quantity} × ${it.unitPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Object.entries(it.options ?? {}).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                  </div>
                </div>
                <div className="font-bold">${it.lineTotal.toFixed(2)}</div>
              </div>
              {it.files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {it.files.map((f) => (
                    <Button key={f.id} asChild variant="outline" size="sm">
                      <a href={apiPath(`/api/uploads/${f.id}/download`)} target="_blank" rel="noopener noreferrer">
                        <FileDown className="w-3 h-3 mr-1" /> {f.originalName} ({(f.fileSize / 1024).toFixed(0)} KB)
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border space-y-1 text-sm bg-muted/20">
          <Row label="Subtotal" value={`$${data.subtotal.toFixed(2)}`} />
          <Row label="Shipping" value={`$${data.shipping.toFixed(2)}`} />
          <Row label="Tax" value={`$${data.tax.toFixed(2)}`} />
          <div className="flex justify-between text-lg font-black pt-2 border-t border-border"><span>Total</span><span>${data.total.toFixed(2)}</span></div>
        </div>
      </div>

      {data.payments.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border font-bold">Payment history</div>
          <div className="divide-y divide-border">
            {data.payments.map((p) => (
              <div key={p.id} className="px-6 py-3 flex justify-between text-sm">
                <div>
                  <div className="font-medium">{p.provider} {p.providerTransactionId && <span className="text-muted-foreground">• {p.providerTransactionId}</span>}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${p.amount.toFixed(2)}</div>
                  <StatusPill kind="payment" status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="text-foreground font-medium">{value}</span></div>;
}

function AddressBlock({ address }: { address: { line1: string; line2?: string | null; city: string; state: string; postalCode: string; country: string } }) {
  return (
    <div className="text-sm">
      <div>{address.line1}</div>
      {address.line2 && <div>{address.line2}</div>}
      <div>{address.city}, {address.state} {address.postalCode}</div>
      <div>{address.country}</div>
    </div>
  );
}
