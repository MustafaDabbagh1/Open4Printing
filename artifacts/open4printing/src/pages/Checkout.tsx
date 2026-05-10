import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/use-seo";
import { useCreateOrder, useChargeAuthorizeNet } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Lock, CreditCard, Truck, Store } from "lucide-react";
import { products as catalogProducts } from "@/data/products";

const TAX_RATE = 0.0875;

export default function Checkout() {
  useSeo({ title: "Checkout", description: "Place your print order." });
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const charge = useChargeAuthorizeNet();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [delivery, setDelivery] = useState<"shipping" | "pickup">("shipping");

  const [shipLine1, setShipLine1] = useState("");
  const [shipLine2, setShipLine2] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostal, setShipPostal] = useState("");
  const [shipCountry, setShipCountry] = useState("US");

  const [billSame, setBillSame] = useState(true);
  const [billLine1, setBillLine1] = useState("");
  const [billLine2, setBillLine2] = useState("");
  const [billCity, setBillCity] = useState("");
  const [billState, setBillState] = useState("");
  const [billPostal, setBillPostal] = useState("");
  const [billCountry, setBillCountry] = useState("US");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardZip, setCardZip] = useState("");

  const [notes, setNotes] = useState("");

  const shipping = delivery === "pickup" ? 0 : subtotal > 100 ? 0 : 15.99;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
        <Button onClick={() => setLocation("/")}>Browse products</Button>
      </div>
    );
  }

  const slugFor = (productId: string): string => {
    const p = catalogProducts.find((x) => x.id === productId);
    return p?.slug ?? productId;
  };

  const formatExpiryForApi = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 4) return digits;
    return digits.slice(0, 4); // MMYY
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const shippingAddress = {
      line1: delivery === "pickup" ? "Pickup in store" : shipLine1,
      line2: delivery === "pickup" ? null : (shipLine2 || null),
      city: delivery === "pickup" ? "Pickup" : shipCity,
      state: delivery === "pickup" ? "Pickup" : shipState,
      postalCode: delivery === "pickup" ? "00000" : shipPostal,
      country: delivery === "pickup" ? "US" : shipCountry,
    };
    const billingAddress = billSame
      ? shippingAddress
      : {
          line1: billLine1,
          line2: billLine2 || null,
          city: billCity,
          state: billState,
          postalCode: billPostal,
          country: billCountry,
        };

    let createdOrder;
    try {
      createdOrder = await createOrder.mutateAsync({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || null,
          billingAddress,
          shippingAddress,
          notes: notes ? `${delivery === "pickup" ? "[PICKUP] " : ""}${notes}` : (delivery === "pickup" ? "[PICKUP]" : ""),
          subtotal: +subtotal.toFixed(2),
          tax,
          shipping,
          total,
          items: items.map((it) => {
            const ids = (it.files && it.files.length > 0)
              ? it.files.map((f) => f.id)
              : (it.uploadedFileId != null ? [it.uploadedFileId] : []);
            return {
              productSlug: slugFor(it.productId),
              productName: it.name,
              quantity: it.quantity,
              unitPrice: +it.unitPrice.toFixed(2),
              lineTotal: +(it.unitPrice * it.quantity).toFixed(2),
              options: it.options,
              uploadedFileIds: ids,
            };
          }),
        },
      });
    } catch (err) {
      toast({
        title: "Order failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await charge.mutateAsync({
        data: {
          orderId: createdOrder.id,
          amount: total,
          cardNumber: cardNumber.replace(/\s+/g, ""),
          expirationDate: formatExpiryForApi(cardExpiry),
          cardCode: cardCvv,
        },
      });
    } catch (err) {
      // Order was created — surface the issue but still let the customer reach
      // the confirmation page so they have an order number to reference.
      toast({
        title: "Payment could not be completed",
        description: err instanceof Error ? err.message : "We've saved your order; our team will follow up.",
        variant: "destructive",
      });
    }

    clearCart();
    setLocation(`/order-confirmation/${createdOrder.orderNumber}`);
  };

  const isPlacing = createOrder.isPending || charge.isPending;

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <Section title="Contact information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="First name"><Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
                <Field label="Last name"><Input required value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
                <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Field label="Phone"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(optional)" /></Field>
              </div>
            </Section>

            <Section title="Delivery">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <DeliveryOption
                  selected={delivery === "shipping"}
                  onClick={() => setDelivery("shipping")}
                  icon={Truck}
                  label="Ship"
                  sublabel={subtotal > 100 ? "Free over $100" : "$15.99"}
                />
                <DeliveryOption
                  selected={delivery === "pickup"}
                  onClick={() => setDelivery("pickup")}
                  icon={Store}
                  label="Pickup"
                  sublabel="Free"
                />
              </div>
              {delivery === "shipping" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2"><Field label="Street address"><Input required value={shipLine1} onChange={(e) => setShipLine1(e.target.value)} /></Field></div>
                  <div className="md:col-span-2"><Field label="Apartment, suite, etc. (optional)"><Input value={shipLine2} onChange={(e) => setShipLine2(e.target.value)} /></Field></div>
                  <Field label="City"><Input required value={shipCity} onChange={(e) => setShipCity(e.target.value)} /></Field>
                  <Field label="State"><Input required value={shipState} onChange={(e) => setShipState(e.target.value)} /></Field>
                  <Field label="ZIP code"><Input required value={shipPostal} onChange={(e) => setShipPostal(e.target.value)} /></Field>
                  <Field label="Country"><Input required value={shipCountry} onChange={(e) => setShipCountry(e.target.value)} /></Field>
                </div>
              )}
            </Section>

            <Section title="Billing address">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={billSame} onCheckedChange={(v) => setBillSame(Boolean(v))} />
                <span>Billing address is the same as shipping</span>
              </label>
              {!billSame && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="md:col-span-2"><Field label="Street address"><Input required value={billLine1} onChange={(e) => setBillLine1(e.target.value)} /></Field></div>
                  <div className="md:col-span-2"><Field label="Apartment, suite, etc. (optional)"><Input value={billLine2} onChange={(e) => setBillLine2(e.target.value)} /></Field></div>
                  <Field label="City"><Input required value={billCity} onChange={(e) => setBillCity(e.target.value)} /></Field>
                  <Field label="State"><Input required value={billState} onChange={(e) => setBillState(e.target.value)} /></Field>
                  <Field label="ZIP code"><Input required value={billPostal} onChange={(e) => setBillPostal(e.target.value)} /></Field>
                  <Field label="Country"><Input required value={billCountry} onChange={(e) => setBillCountry(e.target.value)} /></Field>
                </div>
              )}
            </Section>

            <Section
              title={
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</span>
              }
            >
              <div className="space-y-3">
                <Field label="Card number">
                  <Input
                    required
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={23}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiration (MM/YY)">
                    <Input
                      required
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </Field>
                  <Field label="CVV">
                    <Input
                      required
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name on card">
                    <Input required autoComplete="cc-name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                  </Field>
                  <Field label="Billing ZIP">
                    <Input required value={cardZip} onChange={(e) => setCardZip(e.target.value)} />
                  </Field>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <Lock className="w-3 h-3" /> Payments will be securely processed. Your card details are not stored by Open4Printing.
                </p>
              </div>
            </Section>

            <Section title="Order notes (optional)">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything we should know about your order?" />
            </Section>
          </div>

          <aside className="lg:col-span-5">
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 lg:sticky lg:top-24 space-y-4">
              <h2 className="text-base font-semibold">Order summary</h2>
              <div className="divide-y divide-border">
                {items.map((it) => (
                  <div key={it.id} className="py-3 flex justify-between gap-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
                      {Object.keys(it.options ?? {}).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {Object.entries(it.options).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                        </div>
                      )}
                      {(it.files && it.files.length > 0
                        ? it.files
                        : (it.fileName && it.uploadedFileId != null ? [{ id: it.uploadedFileId, name: it.fileName, side: undefined as 'front' | 'back' | undefined }] : [])
                      ).map((f) => (
                        <div key={f.id} className="text-xs text-emerald-700 mt-0.5 truncate">
                          📎 {f.side ? `[${f.side === 'front' ? 'Front' : 'Back'}] ` : ''}{f.name}
                        </div>
                      ))}
                    </div>
                    <div className="font-semibold whitespace-nowrap">${(it.unitPrice * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 text-sm border-t border-border pt-3">
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label={delivery === "pickup" ? "Pickup" : "Shipping"} value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
                <Row label={`Tax (${(TAX_RATE * 100).toFixed(2)}%)`} value={`$${tax.toFixed(2)}`} />
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button type="submit" size="lg" disabled={isPlacing} className="w-full h-12 rounded-lg text-base">
                {isPlacing ? "Placing order…" : `Place order — $${total.toFixed(2)}`}
              </Button>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p>Every order is reviewed by a real person before we print. We'll reach out if anything looks off.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h2 className="text-base font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function DeliveryOption({ selected, onClick, icon: Icon, label, sublabel }: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Truck;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-foreground/30"}`}
    >
      <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sublabel}</div>
      </div>
    </button>
  );
}

function formatCardNumber(v: string): string {
  return v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
