import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetAdminQuote, useUpdateAdminQuote, getGetAdminQuoteQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiPath } from "@/lib/api";

const STATUSES = ["new", "reviewing", "quoted", "accepted", "declined", "closed"];

export default function AdminQuoteDetail() {
  return (
    <AdminLayout>
      <Inner />
    </AdminLayout>
  );
}

function Inner() {
  const { id } = useParams<{ id: string }>();
  const quoteId = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useGetAdminQuote(quoteId);
  const update = useUpdateAdminQuote();
  const [status, setStatus] = useState("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setAdminNotes(data.adminNotes);
      setQuotedAmount(data.quotedAmount ?? "");
    }
  }, [data]);

  if (isLoading || !data) return <div>Loading…</div>;

  const save = async () => {
    try {
      await update.mutateAsync({ id: quoteId, data: { status, adminNotes, quotedAmount: quotedAmount || null } });
      await queryClient.invalidateQueries({ queryKey: getGetAdminQuoteQueryKey(quoteId) });
      toast({ title: "Quote updated" });
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/quotes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> All quotes</Link>
      <div>
        <h1 className="text-3xl font-serif font-black">Quote #{data.id}</h1>
        <p className="text-muted-foreground">{new Date(data.createdAt).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Customer</div>
          <div className="font-bold">{data.name}</div>
          <div className="text-sm">{data.email}</div>
          {data.phone && <div className="text-sm">{data.phone}</div>}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Request</div>
          <div className="text-sm"><span className="font-medium">Category:</span> {data.productCategory}</div>
          {data.requestedQuantity != null && <div className="text-sm"><span className="font-medium">Quantity:</span> {data.requestedQuantity}</div>}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Description</div>
        <p className="whitespace-pre-wrap text-sm">{data.description}</p>
        {data.notes && (<><div className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">Customer notes</div><p className="whitespace-pre-wrap text-sm">{data.notes}</p></>)}
      </div>

      {data.files.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Attachments</div>
          <div className="flex flex-wrap gap-2">
            {data.files.map((f) => (
              <Button key={f.id} asChild variant="outline" size="sm">
                <a href={apiPath(`/api/uploads/${f.id}/download`)} target="_blank" rel="noopener noreferrer"><FileDown className="w-3 h-3 mr-1" />{f.originalName}</a>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Quoted amount (optional)</label>
            <Input value={quotedAmount} onChange={(e) => setQuotedAmount(e.target.value)} placeholder="e.g. $499.00" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Admin notes</label>
          <Textarea rows={4} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
        </div>
        <Button onClick={save} disabled={update.isPending}>Save changes</Button>
      </div>
    </div>
  );
}
