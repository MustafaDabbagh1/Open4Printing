import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  useCustomerMe,
  useListCustomerAddresses,
  useCreateCustomerAddress,
  getListCustomerAddressesQueryKey,
  getCustomerMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CustomerAddresses() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const me = useCustomerMe({ query: { queryKey: getCustomerMeQueryKey(), retry: false } });
  const list = useListCustomerAddresses({ query: { queryKey: getListCustomerAddressesQueryKey(), enabled: Boolean(me.data), retry: false } });
  const create = useCreateCustomerAddress();

  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  useEffect(() => {
    if (me.error) setLocation("/account/login");
  }, [me.error, setLocation]);

  if (me.isLoading || !me.data) return <div className="container py-16">Loading…</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        data: { label, address: { line1, line2: line2 || null, city, state, postalCode, country }, isDefault: list.data?.length === 0 },
      });
      await queryClient.invalidateQueries({ queryKey: getListCustomerAddressesQueryKey() });
      setLine1(""); setLine2(""); setCity(""); setState(""); setPostalCode("");
      toast({ title: "Address saved" });
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">← Back to orders</Link>
        <h1 className="text-3xl font-serif font-black mt-2">Saved addresses</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border mb-6">
        {list.isLoading && <div className="p-6 text-muted-foreground text-sm">Loading…</div>}
        {list.data && list.data.length === 0 && <div className="p-6 text-muted-foreground text-sm">No saved addresses yet.</div>}
        {list.data?.map((a) => (
          <div key={a.id} className="px-6 py-4 text-sm">
            <div className="font-bold mb-1">{a.label}{a.isDefault && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Default</span>}</div>
            <div>{a.address.line1}</div>
            {a.address.line2 && <div>{a.address.line2}</div>}
            <div>{a.address.city}, {a.address.state} {a.address.postalCode}</div>
            <div className="text-muted-foreground">{a.address.country}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-bold">Add a new address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-xs">Label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <div className="md:col-span-2 space-y-1.5"><Label className="text-xs">Street address</Label><Input required value={line1} onChange={(e) => setLine1(e.target.value)} /></div>
          <div className="md:col-span-2 space-y-1.5"><Label className="text-xs">Apt, suite (optional)</Label><Input value={line2} onChange={(e) => setLine2(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">City</Label><Input required value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">State</Label><Input required value={state} onChange={(e) => setState(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">ZIP / postal</Label><Input required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></div>
        </div>
        <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save address"}</Button>
      </form>
    </div>
  );
}
