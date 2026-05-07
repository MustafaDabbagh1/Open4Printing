import { useSeo } from "@/hooks/use-seo";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, FileCheck2, Zap, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/products";

export default function Cart() {
  useSeo({ title: "Your Cart", description: "Review your print order." });
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const shipping = subtotal > 100 ? 0 : 15.99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    toast({
      title: "Order requested!",
      description: "We've received your request. A representative will contact you shortly.",
    });
    setTimeout(() => {
      clearCart();
      setLocation("/");
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 bg-muted/20 min-h-[60vh]">
        <div className="w-32 h-32 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 shadow-inner">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-serif font-black mb-4">Your cart is empty</h1>
        <p className="text-xl text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
          Looks like you haven't added any products yet. Let's get some ink on paper!
        </p>
        <Button size="lg" className="rounded-full h-14 px-8 text-lg hover-elevate" onClick={() => setLocation("/")}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-12">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-card rounded-[2rem] border border-border shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative group hover:shadow-md transition-shadow">
              
              <div className="w-full md:w-32 aspect-square rounded-2xl bg-muted shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="text-2xl font-bold font-serif hover:text-primary transition-colors truncate">{item.name}</h3>
                  </Link>
                  <div className="text-2xl font-black">${(item.unitPrice * item.quantity).toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4 mb-6 text-sm text-muted-foreground">
                  {Object.entries(item.options).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-semibold text-foreground/70">{key}:</span> 
                      <span className="truncate">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
                  {item.fileName ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <FileCheck2 className="w-4 h-4" /> 
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.fileName}</span>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                      No artwork attached
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                      <button 
                        className="px-3 py-1 hover:bg-muted transition-colors font-medium"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center bg-transparent border-x border-border font-medium focus:outline-none"
                      />
                      <button 
                        className="px-3 py-1 hover:bg-muted transition-colors font-medium"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-card rounded-[2rem] border border-border shadow-xl p-8 sticky top-24">
            <h2 className="text-2xl font-serif font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-4 text-lg mb-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-black text-2xl">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full h-16 text-xl rounded-2xl shadow-xl hover-elevate mb-6" onClick={handleCheckout}>
              Request Order <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p>Secure checkout powered by Stripe. We never store your credit card information.</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Zap className="w-5 h-5 text-primary shrink-0" />
                <p>Need it faster? Rush production and expedited shipping options available at checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
