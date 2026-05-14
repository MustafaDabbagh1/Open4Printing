import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useSeo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Smartphone,
  Wifi,
  ShieldCheck,
  Headphones,
  Zap,
  Gift,
  TrendingUp,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Lock,
  Activity,
  Sparkles,
} from "lucide-react";

const BENEFITS = [
  { icon: Gift, title: "Free POS systems", desc: "Qualify and we'll cover the hardware — no upfront cost." },
  { icon: TrendingUp, title: "Competitive rates", desc: "Transparent pricing tailored to your monthly volume." },
  { icon: Headphones, title: "24/7 support", desc: "Real humans, on the phone, any hour of the day." },
  { icon: Zap, title: "Fast & secure", desc: "PCI-compliant transactions that settle next business day." },
  { icon: Wifi, title: "Wireless or countertop", desc: "Modern terminals for any storefront or on-the-go business." },
  { icon: ShieldCheck, title: "Easy onboarding", desc: "Get approved and processing in as little as 24 hours." },
];

const POS_OPTIONS = [
  {
    name: "Countertop Terminal",
    tag: "Most popular",
    desc: "Sleek all-in-one terminal for retail counters and front desks.",
    features: ["Chip, swipe & tap", "Receipt printer", "Connects via Wi-Fi or Ethernet"],
  },
  {
    name: "Wireless Handheld",
    tag: "Best for restaurants",
    desc: "Take payments at the table or anywhere on the floor.",
    features: ["Long battery life", "4G + Wi-Fi", "Built-in receipt printer"],
  },
  {
    name: "Smart POS Tablet",
    tag: "All-in-one",
    desc: "Inventory, reporting, and payments on a modern touchscreen.",
    features: ["Cloud reporting", "Customer display", "Integrated card reader"],
  },
];

const INDUSTRIES = [
  { icon: Store, label: "Retail Stores" },
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: ShoppingBag, label: "Markets" },
  { icon: Wrench, label: "Service Businesses" },
];

const PAYMENT_METHODS = [
  "Credit cards",
  "Debit cards",
  "Tap-to-pay",
  "Chip cards",
  "Apple Pay",
  "Google Pay",
];

// PPD-style dashboard mockup — no faces, only abstract UI
function PaymentDashboardMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Floating "Payment Approved" card */}
      <div className="absolute -top-4 -right-2 z-20 bg-slate-800/95 backdrop-blur border border-emerald-400/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 rotate-[3deg]">
        <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white">Payment Approved</div>
          <div className="text-[10px] text-slate-400">Visa •••• 4242 — $189.00</div>
        </div>
      </div>

      {/* Floating PCI badge */}
      <div className="absolute -bottom-3 -left-3 z-20 bg-slate-800/95 backdrop-blur border border-cyan-400/40 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-2 rotate-[-4deg]">
        <Lock className="w-4 h-4 text-cyan-400" />
        <div className="text-[11px] font-bold text-white">PCI Level 1</div>
      </div>

      {/* Dashboard window */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur shadow-2xl overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/60 bg-slate-900">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 text-[11px] text-slate-400 font-mono">POS Dashboard</div>
          <div className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Today's Revenue</div>
            <div className="text-2xl font-black text-white">$12,847</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">↑ 18.2%</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Transactions</div>
            <div className="text-2xl font-black text-white">1,284</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">↑ 12.6%</div>
          </div>

          {/* Sparkline panel */}
          <div className="col-span-2 rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">7-Day Trend</div>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <svg viewBox="0 0 200 50" className="w-full h-12">
              <defs>
                <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 L25,32 L50,35 L75,22 L100,28 L125,18 L150,20 L175,10 L200,12 L200,50 L0,50 Z"
                fill="url(#trendGrad)"
              />
              <path
                d="M0,40 L25,32 L50,35 L75,22 L100,28 L125,18 L150,20 L175,10 L200,12"
                fill="none"
                stroke="rgb(34, 211, 238)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Recent txns */}
          <div className="col-span-2 rounded-xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recent</div>
            {[
              { brand: "Visa", last4: "4242", amt: "$189.00" },
              { brand: "Mastercard", last4: "8831", amt: "$67.50" },
              { brand: "Amex", last4: "1009", amt: "$342.00" },
            ].map((t) => (
              <div key={t.last4} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">{t.brand}</span>
                  <span className="text-slate-500">•••• {t.last4}</span>
                </div>
                <div className="font-bold text-white">{t.amt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentProcessingPos() {
  useSeo({
    title: "Payment Processing & POS Systems",
    description:
      "Free POS systems, competitive payment processing rates, 24/7 support. Modern countertop and wireless terminals for retail, restaurants, markets, and service businesses.",
  });
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col">
      {/* Hero — PPD-inspired dark theme */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Dotted pattern bg */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Modern Payment Infrastructure
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6 leading-[1.05]">
              Payment Processing &{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                POS Systems
              </span>{" "}
              for Modern Business
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-xl">
              Free POS hardware, competitive rates, and 24/7 support — everything you need to accept
              payments in-store, at the table, or on the go.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                data-testid="button-ask-free-pos"
              >
                Ask About Free POS Systems
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Get a Free Quote
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
              <div className="flex -space-x-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-slate-950 flex items-center justify-center">
                  <Store className="w-3 h-3 text-white" />
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-slate-950 flex items-center justify-center">
                  <UtensilsCrossed className="w-3 h-3 text-white" />
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-slate-950 flex items-center justify-center">
                  <ShoppingBag className="w-3 h-3 text-white" />
                </div>
              </div>
              Trusted by <span className="text-white font-bold">thousands</span> of businesses nationwide
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PaymentDashboardMockup />
          </motion.div>
        </div>

        {/* Payment methods strip */}
        <div className="relative z-10 border-t border-white/10 bg-white/[0.02]">
          <div className="container mx-auto px-4 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {PAYMENT_METHODS.map((m) => (
              <div key={m} className="inline-flex items-center gap-2 text-sm text-slate-300 font-semibold">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <Badge variant="outline" className="mb-3">Benefits</Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">
              Everything you need to start accepting payments
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Modern hardware, fair pricing, and the support team that actually picks up the phone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6" />
                </div>
                <div className="text-lg font-bold mb-1">{b.title}</div>
                <div className="text-sm text-muted-foreground leading-snug">{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POS Options */}
      <section className="bg-muted/30 border-y border-border py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <Badge variant="outline" className="mb-3">POS Options</Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">
              Pick the POS that fits your business
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              From compact countertops to full smart tablets — we'll match you to the right setup.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {POS_OPTIONS.map((opt, i) => (
              <motion.div
                key={opt.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-card border border-border rounded-3xl p-7 flex flex-col hover:shadow-2xl hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
                    {i === 0 && <CreditCard className="w-6 h-6" />}
                    {i === 1 && <Smartphone className="w-6 h-6" />}
                    {i === 2 && <Sparkles className="w-6 h-6" />}
                  </div>
                  <Badge variant="secondary" className="text-[11px]">{opt.tag}</Badge>
                </div>
                <div className="text-xl font-bold mb-2">{opt.name}</div>
                <div className="text-sm text-muted-foreground mb-5">{opt.desc}</div>
                <ul className="space-y-2 mb-6 flex-1">
                  {opt.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/quote")}
                  className="w-full rounded-full font-semibold"
                >
                  Ask about this POS
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <Badge variant="outline" className="mb-3">Industries we serve</Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">
              Built for the businesses that move your community
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              We tune your POS to your industry — payments, reporting, and hardware that fit how you actually work.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.label}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/40 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <ind.icon className="w-7 h-7" />
                </div>
                <div className="text-base font-bold">{ind.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-muted/30 border-y border-border py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <Badge variant="outline" className="mb-3">Why choose us</Badge>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-5">
                Real support, fair pricing, modern hardware.
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6">
                We don't lock you into long contracts or surprise you with junk fees. Just transparent
                payment processing and people who answer the phone when you call.
              </p>
              <Button
                size="lg"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
              >
                Upgrade Your Payment System
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <ul className="space-y-4">
              {[
                { icon: DollarSign, title: "Transparent pricing", desc: "No hidden fees, no surprise rate hikes." },
                { icon: Headphones, title: "24/7 live support", desc: "Real humans, available any time of day or night." },
                { icon: ShieldCheck, title: "PCI Level 1 secure", desc: "Bank-grade security on every transaction." },
                { icon: Zap, title: "Fast next-day funding", desc: "Get paid quickly — no week-long holdups." },
              ].map((w) => (
                <li key={w.title} className="flex gap-4 bg-card border border-border rounded-2xl p-5">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <w.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-0.5">{w.title}</div>
                    <div className="text-sm text-muted-foreground">{w.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="relative overflow-hidden bg-slate-950 text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Get started today
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-5">
              Ready to upgrade your payment system?
            </h2>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Tell us about your business and we'll send a tailored quote — including free POS hardware
              if you qualify.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              >
                Ask About Free POS Systems
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Get a Free Quote
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
