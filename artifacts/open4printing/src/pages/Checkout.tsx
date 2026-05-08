import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/use-seo";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { products as catalogProducts } from "@/data/products";

const TAX_RATE = 0.0875;

export default function Checkout() {
  useSeo({ title: "Checkout", description: "Place your print order." });
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [billLine1, setBillLine1] = useState("");
  const [billLine2, setBillLine2] = useState("");
  const [billCity, setBillCity] = useState("");
  const [billState, setBillState] = useState("");
  const [billPostal, setBillPostal] = useState("");
  const [billCountry, setBillCountry] = useState("US");
  const [shipSame, setShipSame] = useState(true);
  const [shipLine1, setShipLine1] = useState("");
  const [shipLine2, setShipLine2] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostal, setShipPostal] = useState("");
  const [shipCountry, setShipCountry] = useState("US");
  const [notes, setNotes] = useState("");

  const shipping = subtotal > 100 ? 0 : 15.99;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-black mb-4">Your cart is empty</h1>
        <Button onClick={() => setLocation("/")}>Browse products</Button>
      </div>
    );
  }

  const slugFor = (productId: string): string => {
    const p = catalogProducts.find((x) => x.id === productId);
    return p?.slug ?? productId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const billingAddress = {
      line1: billLine1,
      line2: billLine2 || null,
      city: billCity,
      state: billState,
      postalCode: billPostal,
      country: billCountry,
    };
    const shippingAddress = shipSame
      ? billingAddress
      : {
          line1: shipLine1,
          line2: shipLine2 || null,
          city: shipCity,
          state: shipState,
          postalCode: shipPostal,
          country: shipCountry,
        };

    try {
      const result = await createOrder.mutateAsync({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || null,
          billingAddress,
          shippingAddress,
          notes,
          subtotal: +subtotal.toFixed(2),
          tax,
          shipping,
          total,
          items: items.map((it) => ({
            productSlug: slugFor(it.productId),
            productName: it.name,
            quantity: it.quantity,
            unitPrice: +it.unitPrice.toFixed(2),
            lineTotal: +(it.unitPrice * it.quantity).toFixed(2),
            options: it.options,
            uploadedFileIds: it.uploadedFileId != null ? [it.uploadedFileId] : [],
          })),
        },
      });
      clearCart();
      setLocation(`/order-confirmation/${result.orderNumber}`);
    } catch (err) {
      toast({
        title: "Order failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-10">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-card rounded-3xl border border-border p-8 space-y-6">
            <h2 className="text-2xl font-serif font-bold">Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-3xl border border-border p-8 space-y-6">
            <h2 className="text-2xl font-serif font-bold">Billing address</h2>
            <AddressFields
              line1={billLine1} setLine1={setBillLine1}
              line2={billLine2} setLine2={setBillLine2}
              city={billCity} setCity={setBillCity}
              state={billState} setState={setBillState}
              postal={billPostal} setPostal={setBillPostal}
              country={billCountry} setCountry={setBillCountry}
            />
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="shipSame" checked={shipSame} onCheckedChange={(v) => setShipSame(Boolean(v))} />
              <Label htmlFor="shipSame" className="cursor-pointer">Ship to the same address</Label>
            </div>
          </section>

          {!shipSame && (
            <section className="bg-card rounded-3xl border border-border p-8 space-y-6">
              <h2 className="text-2xl font-serif font-bold">Shipping address</h2>
              <AddressFields
                line1={shipLine1} setLine1={setShipLine1}
                line2={shipLine2} setLine2={setShipLine2}
                city={shipCity} setCity={setShipCity}
                state={shipState} setState={setShipState}
                postal={shipPostal} setPostal={setShipPostal}
                country={shipCountry} setCountry={setShipCountry}
              />
            </section>
          )}

          <section className="bg-card rounded-3xl border border-border p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold">Order notes (optional)</h2>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know about your order?" rows={4} />
          </section>

          <section className="bg-card rounded-3xl border border-border p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold">Payment</h2>
            <div className="rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm">
              We'll send you a secure payment link by email after we review your files. Your order will be marked as <strong>Pending Payment</strong> until then.
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-card rounded-3xl border border-border shadow-xl p-8 sticky top-24 space-y-6">
            <h2 className="text-2xl font-serif font-bold">Order summary</h2>
            <div className="divide-y divide-border">
              {items.map((it) => (
                <div key={it.id} className="py-3 flex justify-between text-sm gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{it.name}</div>
                    <div className="text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <div className="font-bold whitespace-nowrap">${(it.unitPrice * it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
              <Row label={`Tax (${(TAX_RATE * 100).toFixed(2)}%)`} value={`$${tax.toFixed(2)}`} />
              <div className="flex justify-between text-2xl font-black pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button type="submit" size="lg" disabled={createOrder.isPending} className="w-full h-14 text-lg rounded-2xl">
              {createOrder.isPending ? "Placing order…" : (<>Place order <ArrowRight className="w-5 h-5 ml-2" /></>)}
            </Button>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>Your order is reviewed by a real person before printing. We'll reach out if anything looks off.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

interface AddressProps {
  line1: string; setLine1: (v: string) => void;
  line2: string; setLine2: (v: string) => void;
  city: string; setCity: (v: string) => void;
  state: string; setState: (v: string) => void;
  postal: string; setPostal: (v: string) => void;
  country: string; setCountry: (v: string) => void;
}
function AddressFields(p: AddressProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label>Address line 1</Label>
        <Input required value={p.line1} onChange={(e) => p.setLine1(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Address line 2 (optional)</Label>
        <Input value={p.line2} onChange={(e) => p.setLine2(e.target.value)} />
      </div>
      <div>
        <Label>City</Label>
        <Input required value={p.city} onChange={(e) => p.setCity(e.target.value)} />
      </div>
      <div>
        <Label>State / Region</Label>
        <Input required value={p.state} onChange={(e) => p.setState(e.target.value)} />
      </div>
      <div>
        <Label>Postal code</Label>
        <Input required value={p.postal} onChange={(e) => p.setPostal(e.target.value)} />
      </div>
      <div>
        <Label>Country</Label>
        <Input required value={p.country} onChange={(e) => p.setCountry(e.target.value)} />
      </div>
    </div>
  );
}
