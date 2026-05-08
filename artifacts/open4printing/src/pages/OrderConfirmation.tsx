import { useParams, Link } from "wouter";
import { useGetOrderByNumber } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, FileCheck2 } from "lucide-react";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  useSeo({ title: `Order ${orderNumber}`, description: "Your order is confirmed." });
  const { data, isLoading, error } = useGetOrderByNumber(orderNumber!);

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center">Loading order…</div>;
  if (error || !data) return <div className="container mx-auto px-4 py-24 text-center">Order not found.</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black mb-3">Thanks, {data.firstName}!</h1>
        <p className="text-lg text-muted-foreground">Your order has been received.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full font-mono text-sm">
          <Package className="w-4 h-4" /> Order #{data.orderNumber}
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-serif font-bold">Items</h2>
        <div className="divide-y divide-border">
          {data.items.map((it) => (
            <div key={it.id} className="py-4 flex justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold">{it.productName}</div>
                <div className="text-sm text-muted-foreground">Qty {it.quantity}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {Object.entries(it.options ?? {}).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                </div>
                {it.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {it.files.map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                        <FileCheck2 className="w-3 h-3" /> {f.originalName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="font-bold whitespace-nowrap">${it.lineTotal.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${data.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>${data.shipping.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>${data.tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-xl font-black pt-2 border-t border-border"><span>Total</span><span>${data.total.toFixed(2)}</span></div>
        </div>
      </div>

      {data.paymentStatus === "paid" ? (
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 rounded-2xl p-6 mb-8">
          <h3 className="font-bold mb-2">Payment received</h3>
          <p className="text-sm">Thanks! Your payment was successfully processed. Our team will review your files within 4 business hours and send a production update by email.</p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 rounded-2xl p-6 mb-8">
          <h3 className="font-bold mb-2">Payment status: {data.paymentStatus.replace(/_/g, " ")}</h3>
          <p className="text-sm">Your order has been received. Our team will be in touch shortly with next steps.</p>
        </div>
      )}

      <div className="text-center">
        <Link href="/"><Button size="lg" className="rounded-2xl">Back to home</Button></Link>
      </div>
    </div>
  );
}
