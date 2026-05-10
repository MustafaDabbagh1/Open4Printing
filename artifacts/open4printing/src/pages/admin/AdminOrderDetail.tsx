import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetAdminOrder,
  useUpdateAdminOrder,
  useDuplicateAdminOrder,
  useSetAdminOrderProof,
  getGetAdminOrderQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { StatusPill } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileDown, Upload, Copy, RefreshCw } from "lucide-react";
import { apiPath, uploadFile, ACCEPT_FILE_TYPES } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ORDER_STATUSES = [
  "new",
  "awaiting_artwork_review",
  "proof_needed",
  "proof_sent",
  "proof_approved",
  "in_production",
  "ready_for_pickup",
  "shipped",
  "completed",
  "cancelled",
];
const PAYMENT_STATUSES = ["pending_payment", "pending_authorize_net_connection", "test_paid", "paid", "failed", "refunded", "cancelled"];

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
  const [, setLocation] = useLocation();
  const { data, isLoading } = useGetAdminOrder(orderId);
  const update = useUpdateAdminOrder();
  const duplicate = useDuplicateAdminOrder();
  const setProof = useSetAdminOrderProof();
  const fileRef = useRef<HTMLInputElement>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [estimatedReadyDate, setEstimatedReadyDate] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (data) {
      setInternalNotes(data.internalNotes ?? "");
      setPickupInstructions(data.pickupInstructions ?? "");
      setEstimatedReadyDate(data.estimatedReadyDate ? data.estimatedReadyDate.slice(0, 10) : "");
    }
  }, [data]);

  if (isLoading || !data) return <div>Loading…</div>;

  const handleUpdate = async (patch: Record<string, unknown>) => {
    try {
      await update.mutateAsync({ id: orderId, data: patch });
      await queryClient.invalidateQueries({ queryKey: getGetAdminOrderQueryKey(orderId) });
      toast({ title: "Order updated" });
    } catch (err) {
      toast({ title: "Update failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    setUploadingProof(true);
    try {
      const uploaded = await uploadFile(picked);
      await setProof.mutateAsync({ id: orderId, data: { uploadedFileId: uploaded.id } });
      await queryClient.invalidateQueries({ queryKey: getGetAdminOrderQueryKey(orderId) });
      toast({ title: "Proof sent", description: `${picked.name} attached and customer notified.` });
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setUploadingProof(false);
    }
  };

  const handleReorder = async () => {
    try {
      const result = await duplicate.mutateAsync({ id: orderId });
      toast({ title: "Reorder created", description: `New order ${result.orderNumber}` });
      setLocation(`/admin/orders/${result.id}`);
    } catch (err) {
      toast({ title: "Reorder failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> All orders</Link>
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
          <Button variant="outline" size="sm" className="mt-3" onClick={handleReorder} disabled={duplicate.isPending}><Copy className="w-4 h-4 mr-1" /> Reorder</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Update payment status</div>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={data.paymentStatus} onChange={(e) => handleUpdate({ paymentStatus: e.target.value })}>
            {PAYMENT_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Update order status</div>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={data.orderStatus} onChange={(e) => handleUpdate({ orderStatus: e.target.value })}>
            {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Proof</div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">Status: <strong>{data.proofStatus}</strong></span>
          {data.proofFile && (
            <Button asChild variant="outline" size="sm"><a href={apiPath(`/api/uploads/${data.proofFile.id}/download`)} target="_blank" rel="noopener noreferrer"><FileDown className="w-3 h-3 mr-1" /> {data.proofFile.originalName}</a></Button>
          )}
          <input ref={fileRef} type="file" className="hidden" accept={ACCEPT_FILE_TYPES} onChange={handleProofUpload} />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingProof}>
            {uploadingProof ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Uploading…</> : <><Upload className="w-3 h-3 mr-1" /> Send proof to customer</>}
          </Button>
        </div>
        {data.proofComment && (
          <div className="text-sm bg-muted/40 rounded-md px-3 py-2"><span className="font-semibold">Customer reply:</span> {data.proofComment}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Customer</div>
          <div className="font-bold">{data.firstName} {data.lastName}</div>
          <div className="text-sm">{data.email}</div>
          {data.phone && <div className="text-sm">{data.phone}</div>}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Delivery — {data.deliveryMethod}</div>
          {data.deliveryMethod === "shipping" ? <AddressBlock address={data.shippingAddress} /> : (
            <div className="text-sm space-y-1">
              <div>Pickup in store</div>
              {data.pickupInstructions && <div className="text-muted-foreground whitespace-pre-wrap">{data.pickupInstructions}</div>}
            </div>
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Billing</div>
          <AddressBlock address={data.billingAddress} />
        </div>
        {data.notes && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Customer notes</div>
            <div className="text-sm whitespace-pre-wrap">{data.notes}</div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Internal admin notes & timeline</div>
        <Textarea rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Notes only the team can see…" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Pickup instructions</label>
            <Textarea rows={2} value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Estimated ready date</label>
            <Input type="date" value={estimatedReadyDate} onChange={(e) => setEstimatedReadyDate(e.target.value)} />
          </div>
        </div>
        <Button size="sm" onClick={() => handleUpdate({ internalNotes, pickupInstructions, estimatedReadyDate: estimatedReadyDate ? new Date(estimatedReadyDate).toISOString() : null })}>Save admin fields</Button>
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
                  <div className="text-xs text-muted-foreground mt-1">{Object.entries(it.options ?? {}).map(([k, v]) => `${k}: ${v}`).join(" • ")}</div>
                </div>
                <div className="font-bold">${it.lineTotal.toFixed(2)}</div>
              </div>
              {it.files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2" data-testid={`admin-files-${it.id}`}>
                  {it.files.map((f) => {
                    const sideLabel = f.side === "front" ? "Front" : f.side === "back" ? "Back" : null;
                    return (
                      <Button key={f.id} asChild variant="outline" size="sm">
                        <a href={apiPath(`/api/uploads/${f.id}/download`)} target="_blank" rel="noopener noreferrer">
                          <FileDown className="w-3 h-3 mr-1" />
                          {sideLabel && <span className="mr-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">{sideLabel}</span>}
                          {f.originalName}
                          <span className="text-muted-foreground ml-1">({(f.fileType || "file").toUpperCase().replace(/^IMAGE\//, "")} · {(f.fileSize / 1024).toFixed(0)} KB)</span>
                        </a>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border space-y-1 text-sm bg-muted/20">
          <Row label="Subtotal" value={`$${data.subtotal.toFixed(2)}`} />
          {data.discountAmount > 0 && <Row label={`Discount${data.discountCode ? ` (${data.discountCode})` : ""}`} value={`−$${data.discountAmount.toFixed(2)}`} />}
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
