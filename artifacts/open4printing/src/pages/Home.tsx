import { useSeo } from "@/hooks/use-seo";
import { categories, products } from "@/data/products";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, ShieldCheck, Clock, Zap, CheckCircle2, Star, Upload, SlidersHorizontal, PackageCheck, Sparkles, Smartphone, Play, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  useSeo({ title: "Custom Printing Made Simple", description: "Premium online print shop for modern businesses." });
  const [, setLocation] = useLocation();
  const [heroSearch, setHeroSearch] = useState("");

  const popularProducts = products.filter(p => p.isPopular).slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      // In a real app, this would go to a search results page.
      // For now, we'll try to find a matching category or just go to deals.
      const match = products.find(p => p.name.toLowerCase().includes(heroSearch.toLowerCase()));
      if (match) {
        setLocation(`/product/${match.slug}`);
      } else {
        setLocation(`/category/deals`);
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-background/80 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />
        
        <div className="container mx-auto px-4 relative z-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 mb-4 shadow-sm">
              <Zap className="w-4 h-4" /> 
              Next day printing available
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight text-foreground leading-[1.1]">
              Custom printing <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">made simple.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Premium quality paper, vibrant colors, and fast turnaround. Your brand deserves to look its best in the real world.
            </p>

            <div className="max-w-2xl mx-auto mt-10 bg-card p-2 md:p-3 rounded-2xl md:rounded-full shadow-2xl border border-border flex flex-col md:flex-row gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="I want to print..." 
                  className="w-full pl-11 pr-4 h-14 md:h-16 text-lg border-none bg-transparent focus-visible:ring-0 shadow-none rounded-xl md:rounded-l-full"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                />
              </form>
              <div className="flex gap-2 p-1">
                <Button type="submit" size="lg" className="h-12 md:h-14 px-8 rounded-xl md:rounded-full text-lg shadow-lg hover-elevate">
                  Shop Products
                </Button>
                <Button type="button" variant="secondary" size="lg" className="h-12 md:h-14 px-6 rounded-xl md:rounded-full group" onClick={() => setLocation('/upload')}>
                  <Upload className="w-5 h-5 md:mr-2 group-hover:-translate-y-1 transition-transform" />
                  <span className="hidden md:inline">Upload Art</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Free file review</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Satisfaction guaranteed</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Premium materials</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories Carousel / Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">Shop by Category</h2>
              <p className="text-muted-foreground text-lg max-w-xl">From business cards to banners, we've got you covered with premium products.</p>
            </div>
            <Link href="/category/deals" className="hidden md:flex text-primary font-semibold items-center gap-2 hover:gap-3 transition-all">
              View all products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={cat.id}
              >
                <Link href={`/category/${cat.slug}`} className="group block relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-card border border-border">
                  <div className="absolute inset-0 bg-muted">
                    {cat.image && (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-bold font-serif mb-2">{cat.name}</h3>
                    <p className="text-white/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{cat.shortDescription}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-6">Popular Picks</h2>
            <p className="text-xl text-muted-foreground">Our most requested items, crafted to perfection and ready for your custom artwork.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularProducts.map((product, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                key={product.id}
                className="group flex flex-col bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                <Link href={`/product/${product.slug}`} className="relative h-64 bg-muted overflow-hidden">
                  {categories.find(c => c.id === product.categoryId)?.image ? (
                    <img 
                      src={categories.find(c => c.id === product.categoryId)?.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <PackageCheck className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {product.isOnSale && (
                    <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Sale
                    </div>
                  )}
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-2 text-xs font-medium text-primary uppercase tracking-wider">
                    {categories.find(c => c.id === product.categoryId)?.name}
                  </div>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-2xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-muted-foreground mb-6 line-clamp-2 flex-1">{product.shortDescription}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">Starting at</div>
                      <div className="text-2xl font-bold">${product.startingPrice.toFixed(2)}</div>
                    </div>
                    <Button variant="secondary" className="rounded-full shadow-sm hover-elevate">Customize</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works strip */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-6">How It Works</h2>
            <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto">From screen to doorstep in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-primary-foreground/20" />
            
            {[
              { icon: Upload, title: "1. Upload Art", desc: "Drag & drop your files. We accept PDF, PSD, AI, JPG & PNG." },
              { icon: SlidersHorizontal, title: "2. Configure", desc: "Choose your paper stock, size, finish, and quantity." },
              { icon: ShieldCheck, title: "3. We Review", desc: "Our pre-press team checks every file for print-readiness." },
              { icon: PackageCheck, title: "4. Fast Delivery", desc: "Your order is printed and shipped directly to your door." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center mb-6 shadow-xl mx-auto">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-3">{step.title}</h3>
                <p className="text-primary-foreground/80 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 md:p-20 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-6">Got files ready?</Badge>
                <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">Already have your design?</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Skip the setup and go straight to print. Upload your artwork now and our prepress team will verify your files for free before we print.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-lg"><CheckCircle2 className="w-6 h-6 text-primary" /> Exact color matching</li>
                  <li className="flex items-center gap-3 text-lg"><CheckCircle2 className="w-6 h-6 text-primary" /> Free proofing process</li>
                  <li className="flex items-center gap-3 text-lg"><CheckCircle2 className="w-6 h-6 text-primary" /> Fixes for common bleeds/margins</li>
                </ul>
                <Button size="lg" className="w-fit h-14 px-8 text-lg rounded-full" onClick={() => setLocation('/upload')}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Artwork Now
                </Button>
              </div>
              <div className="bg-muted p-12 md:p-20 flex items-center justify-center relative overflow-hidden">
                {/* Decorative dropzone representation */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] opacity-50" />
                <div className="w-full max-w-md aspect-square rounded-3xl border-4 border-dashed border-primary/30 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center shadow-xl relative z-10">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="text-2xl font-bold mb-2">Drop your files here</div>
                  <div className="text-muted-foreground">PDF, AI, PSD, PNG up to 500MB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Web Design Services teaser */}
      <section className="py-16 md:py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">New Service</Badge>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                Web Design Services
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                Custom websites for businesses that need a clean, modern, trustworthy online presence —
                from landing pages to full ecommerce builds. See our recent project for PPD Technology.
              </p>
              <Button
                size="lg"
                onClick={() => setLocation('/web-design-services')}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
                data-testid="button-home-web-design"
              >
                Explore Web Design
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <a
              href="/web-design-services"
              onClick={(e) => { e.preventDefault(); setLocation('/web-design-services'); }}
              className="block rounded-2xl overflow-hidden border border-border shadow-2xl bg-card group"
            >
              <div className="aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}ppdtechnology-screenshot.png`}
                  alt="PPD Technology website screenshot — recent web design project"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client project</div>
                  <div className="text-base font-bold">PPD Technology</div>
                </div>
                <span className="text-sm font-semibold text-primary">View case →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Payment Processing & POS Systems teaser — PPD-inspired dark theme */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-t border-border">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider mb-5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                New Service
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                Payment Processing & POS Systems for Your Business
              </h2>
              <p className="text-base md:text-lg text-slate-300 mb-7 leading-relaxed max-w-xl">
                Get competitive rates, reliable POS systems, and 24/7 support to keep your business running smoothly.
              </p>
              <Button
                size="lg"
                onClick={() => setLocation('/payment-processing-pos')}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                data-testid="button-home-payment-pos"
              >
                Ask About Free POS Systems
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            {/* Dashboard mockup card */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur shadow-2xl overflow-hidden">
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
                  <div className="col-span-2 rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
                    <svg viewBox="0 0 200 50" className="w-full h-12">
                      <defs>
                        <linearGradient id="homeTrendGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,40 L25,32 L50,35 L75,22 L100,28 L125,18 L150,20 L175,10 L200,12 L200,50 L0,50 Z" fill="url(#homeTrendGrad)" />
                      <path d="M0,40 L25,32 L50,35 L75,22 L100,28 L125,18 L150,20 L175,10 L200,12" fill="none" stroke="rgb(34, 211, 238)" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 z-20 bg-slate-800/95 backdrop-blur border border-emerald-400/40 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-2 rotate-[3deg]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div className="text-[11px] font-bold text-white">Payment Approved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Marketing teaser */}
      <section className="py-16 md:py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Visual: phone-shaped short-form video preview, no faces */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative">
                {/* Floating chips */}
                <div className="absolute -top-4 -left-6 px-3 py-1.5 rounded-full bg-card border border-border shadow-lg text-xs font-bold flex items-center gap-1.5 rotate-[-6deg]">
                  <Sparkles className="w-3 h-3 text-primary" /> Reels
                </div>
                <div className="absolute -top-2 right-0 px-3 py-1.5 rounded-full bg-card border border-border shadow-lg text-xs font-bold flex items-center gap-1.5 rotate-[6deg]">
                  <Smartphone className="w-3 h-3 text-primary" /> Shorts
                </div>
                <div className="absolute bottom-6 -left-8 px-3 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg text-xs font-bold flex items-center gap-1.5 rotate-[-8deg]">
                  +312% reach
                </div>
                {/* Phone */}
                <div className="w-[220px] h-[440px] rounded-[2rem] border-[8px] border-foreground/90 bg-foreground/90 shadow-2xl overflow-hidden">
                  <div className="w-full h-full rounded-[1.4rem] bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-7 h-7 text-white fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[10px] font-bold mb-0.5">@yourbrand</div>
                      <div className="text-[10px] opacity-95 leading-tight">✨ 15-second story. #shorts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">New Service</Badge>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                Social Media Marketing
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                Short-form content that gets attention and turns viewers into customers — Reels, TikToks,
                YouTube Shorts, product promos, ad creatives, and full content strategy.
              </p>
              <Button
                size="lg"
                onClick={() => setLocation('/social-media-marketing-services')}
                className="h-12 px-7 rounded-full text-base font-bold shadow-lg hover-elevate"
                data-testid="button-home-social-media"
              >
                Explore Social Media
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
