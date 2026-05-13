import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useSeo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Camera,
  Video,
  Film,
  PenTool,
  CalendarDays,
  Megaphone,
  BarChart3,
  Sparkles,
  Play,
  Hash,
  Music,
  Heart,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const SERVICES = [
  { icon: Film, label: "Short-form video editing", desc: "Cut, color, captions, sound design — ready to post." },
  { icon: Video, label: "Reels, TikToks & YouTube Shorts", desc: "Optimized for each platform's format and trends." },
  { icon: Camera, label: "Product promo videos", desc: "Eye-catching clips that show off your product." },
  { icon: PenTool, label: "Caption writing", desc: "Hooks and CTAs that drive saves and shares." },
  { icon: CalendarDays, label: "Content calendars", desc: "A clear plan so you never wonder what to post." },
  { icon: Megaphone, label: "Social ad creatives", desc: "Scroll-stopping ads built for paid campaigns." },
  { icon: BarChart3, label: "Performance tracking", desc: "Simple monthly reports on what's working." },
];

// Decorative phone mockup with no faces — short-form video preview UI
function PhoneMockup() {
  return (
    <div className="relative">
      {/* Floating decorative icons (no faces) */}
      <div className="absolute -top-6 -left-8 w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg rotate-[-8deg]">
        <Music className="w-6 h-6" />
      </div>
      <div className="absolute -top-4 right-2 w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg rotate-[6deg]">
        <Hash className="w-5 h-5 text-foreground/80" />
      </div>
      <div className="absolute bottom-10 -left-10 w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg rotate-[10deg]">
        <BarChart3 className="w-6 h-6 text-primary" />
      </div>
      <div className="absolute bottom-2 -right-8 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg rotate-[-6deg]">
        <Heart className="w-5 h-5 fill-current" />
      </div>

      {/* Phone frame */}
      <div className="mx-auto w-[260px] h-[520px] rounded-[2.5rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-2xl overflow-hidden relative">
        {/* Screen */}
        <div className="w-full h-full rounded-[1.75rem] bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />
          {/* Center play button — represents short-form video */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
              <Play className="w-9 h-9 text-white fill-current ml-1" />
            </div>
          </div>
          {/* Right side action rail (no faces — abstract icons) */}
          <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="text-[10px] text-white/90 font-bold">128K</div>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-[10px] text-white/90 font-bold">3.2K</div>
          </div>
          {/* Bottom caption strip */}
          <div className="absolute bottom-3 left-3 right-14 text-white">
            <div className="text-xs font-bold mb-1">@yourbrand</div>
            <div className="text-[11px] opacity-95 leading-tight">
              ✨ Your product, your story — in 15 seconds. #shorts #trending
            </div>
          </div>
        </div>
      </div>

      {/* Editing-timeline strip below */}
      <div className="mt-6 max-w-[300px] mx-auto bg-card border border-border rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeline</div>
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="text-[9px] w-10 text-muted-foreground">VIDEO</div>
            <div className="flex-1 h-2 rounded bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-[9px] w-10 text-muted-foreground">AUDIO</div>
            <div className="flex-1 h-2 rounded bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-[9px] w-10 text-muted-foreground">CAPS</div>
            <div className="flex-1 h-2 rounded bg-gradient-to-r from-amber-300 to-yellow-500 opacity-80 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialMediaMarketingServices() {
  useSeo({
    title: "Social Media Marketing Services",
    description:
      "Short-form video, Reels, TikToks, YouTube Shorts, product promos, ad creatives, and content strategy for businesses.",
  });
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-5 px-4 py-1.5">Social Media Marketing</Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-5">
              Social Media Marketing Services
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Helping businesses create short-form content that gets attention and turns viewers into customers —
              Reels, TikToks, Shorts, product promos, and ad creatives.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/quote")}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
                data-testid="button-request-social-help"
              >
                Request Social Media Help
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

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* Focus chips */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {[
            { icon: Film, label: "Short-form video" },
            { icon: Video, label: "Reels" },
            { icon: Smartphone, label: "TikToks" },
            { icon: Play, label: "YouTube Shorts" },
            { icon: Camera, label: "Product videos" },
            { icon: Megaphone, label: "Business promo clips" },
            { icon: Sparkles, label: "Ad creatives" },
            { icon: CalendarDays, label: "Content strategy" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-semibold shadow-sm"
            >
              <chip.icon className="w-4 h-4 text-primary" />
              {chip.label}
            </div>
          ))}
        </div>
      </section>

      {/* Services Included */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3">What's included</Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Built for short-form, built to convert
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              We handle the full content loop — from idea to edit to analytics.
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

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="bg-card border border-border shadow-2xl rounded-[2.5rem] p-10 md:p-14 text-center">
          <Badge variant="secondary" className="mb-4">Let's grow your audience</Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            Get scroll-stopping content, every week.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Tell us about your brand and we'll send back a content plan and clear pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setLocation("/quote")}
              className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Request Social Media Help
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
