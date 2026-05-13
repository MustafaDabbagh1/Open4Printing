import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useSeo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ShoppingCart,
  Smartphone,
  Sparkles,
  RefreshCw,
  CreditCard,
  MailOpen,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const SERVICES = [
  { icon: Globe, label: "Business websites", desc: "Modern, professional sites that build trust." },
  { icon: ShoppingCart, label: "Ecommerce websites", desc: "Storefronts with cart, checkout, and inventory." },
  { icon: Sparkles, label: "Landing pages", desc: "High-converting pages for campaigns and launches." },
  { icon: Smartphone, label: "Mobile responsive design", desc: "Looks great on phones, tablets, and desktops." },
  { icon: RefreshCw, label: "Website redesigns", desc: "Refresh dated sites with a clean modern look." },
  { icon: CreditCard, label: "Checkout & product setup", desc: "Smooth purchase flows and product catalogs." },
  { icon: MailOpen, label: "Contact forms & lead capture", desc: "Capture inquiries and never miss a lead." },
];

export default function WebDesignServices() {
  useSeo({
    title: "Professional Web Design Services",
    description:
      "Custom websites for businesses that need a clean, modern, trustworthy online presence. Ecommerce, landing pages, redesigns, and more.",
  });
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-5 px-4 py-1.5">Web Design Services</Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-5">
              Professional Web Design Services
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Custom websites for businesses that need a clean, modern, trustworthy online presence.
              We design, build, and launch sites that turn visitors into customers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
                data-testid="button-request-web-design-quote"
              >
                Request a Web Design Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/help")}
                className="h-12 px-7 rounded-full text-base font-semibold"
              >
                Talk to our team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio: PPD Technology */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <Badge variant="outline" className="mb-3">Client Portfolio</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Recent project: PPD Technology
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
              A modern marketing site for a payment infrastructure company — clean dark theme,
              clear product positioning, conversion-focused calls-to-action.
            </p>
          </div>
          <a
            href="https://ppdtechnology.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Visit ppdtechnology.com <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden border border-border shadow-2xl bg-card"
        >
          <div className="aspect-[16/10] bg-muted overflow-hidden">
            <img
              src={`${import.meta.env.BASE_URL}ppdtechnology-screenshot.png`}
              alt="PPD Technology website — homepage screenshot showing payment dashboard hero"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Industry</div>
              <div className="text-base font-semibold">Fintech / Payments</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Scope</div>
              <div className="text-base font-semibold">Marketing site, product pages, lead capture</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Result</div>
              <div className="text-base font-semibold">Clear positioning & conversion-ready CTAs</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Included */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3">What's included</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Everything you need to launch
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              Pick what fits your project — start small with a landing page, or go end-to-end with a full ecommerce build.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-base font-bold mb-1">{s.label}</div>
                <div className="text-sm text-muted-foreground leading-snug">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process strip */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Discovery", desc: "We learn your business, goals, and audience." },
            { step: "2", title: "Design", desc: "Mockups & a clear visual direction you approve." },
            { step: "3", title: "Build", desc: "We code it cleanly and make it fast." },
            { step: "4", title: "Launch", desc: "We deploy, train, and support." },
          ].map((p) => (
            <div key={p.step} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center">
                {p.step}
              </div>
              <div>
                <div className="text-lg font-bold">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4">
        <div className="bg-card border border-border shadow-2xl rounded-[2.5rem] p-10 md:p-14 text-center">
          <Badge variant="secondary" className="mb-4">Ready to start?</Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            Let's build something your customers will love.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Tell us about your project and we'll send a clear quote — usually within one business day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setLocation("/quote")}
              className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Request a Web Design Quote
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
