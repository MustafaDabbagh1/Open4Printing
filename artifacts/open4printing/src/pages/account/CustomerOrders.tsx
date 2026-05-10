import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import {
  useCustomerMe,
  useListCustomerOrders,
  useCustomerLogout,
  getCustomerMeQueryKey,
  getListCustomerOrdersQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function CustomerOrders() {
  const [, setLocation] = useLocation();
  const me = useCustomerMe({ query: { queryKey: getCustomerMeQueryKey(), retry: false } });
  const orders = useListCustomerOrders({ query: { queryKey: getListCustomerOrdersQueryKey(), enabled: Boolean(me.data), retry: false } });
  const logout = useCustomerLogout();

  useEffect(() => {
    if (me.error) setLocation("/account/login");
  }, [me.error, setLocation]);

  if (me.isLoading || !me.data) return <div className="container py-16">Loading…</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-black">Hi, {me.data.firstName}</h1>
          <p className="text-muted-foreground">{me.data.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/account/addresses">Saved addresses</Link></Button>
          <Button size="sm" variant="ghost" onClick={async () => { await logout.mutateAsync(); setLocation("/account/login"); }}>Sign out</Button>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Your orders</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {orders.isLoading && <div className="p-6 text-muted-foreground text-sm">Loading…</div>}
        {orders.data && orders.data.length === 0 && <div className="p-6 text-muted-foreground text-sm">You haven't placed any orders yet.</div>}
        <div className="divide-y divide-border">
          {orders.data?.map((o) => (
            <Link key={o.id} href={`/order-confirmation/${o.orderNumber}`} className="block px-6 py-4 hover:bg-muted/30">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-mono text-sm font-bold">#{o.orderNumber}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()} · {o.itemCount} item(s)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${o.total.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{o.orderStatus}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
