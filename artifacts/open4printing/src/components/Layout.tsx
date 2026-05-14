import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, User, HelpCircle, Search, Menu, ChevronDown, Package, FileUp, Zap, MapPin, Mail, Phone } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { categories, products } from "@/data/products";
import { useState } from "react";

// Sinalite-style mega menu: each top-level item maps to a category page and
// reveals a panel with clickable subcategory/product columns.
type NavCol = { heading: string; items: { label: string; href: string }[] };
type NavGroup = { label: string; href: string; columns: NavCol[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Business Cards",
    href: "/category/business-cards",
    columns: [
      {
        heading: "Standard",
        items: [
          { label: "Standard Business Cards", href: "/product/standard-business-cards" },
          { label: "Premium Soft Touch Cards", href: "/product/premium-soft-touch-cards" },
          { label: "Shop all Business Cards", href: "/category/business-cards" },
        ],
      },
      {
        heading: "Specialty Finishes",
        items: [
          { label: "Soft Touch Lamination", href: "/product/premium-soft-touch-cards" },
          { label: "Matte / Gloss Cardstock", href: "/product/standard-business-cards" },
          { label: "Request a custom quote", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Flyers",
    href: "/category/postcards-flyers",
    columns: [
      {
        heading: "Popular Sizes",
        items: [
          { label: 'Standard Postcards', href: "/product/standard-postcards" },
          { label: "Shop all Print Advertising", href: "/category/postcards-flyers" },
        ],
      },
    ],
  },
  {
    label: "Postcards",
    href: "/category/postcards-flyers",
    columns: [
      {
        heading: "Postcards",
        items: [
          { label: "Standard Postcards", href: "/product/standard-postcards" },
          { label: "Shop all Postcards & Flyers", href: "/category/postcards-flyers" },
        ],
      },
    ],
  },
  {
    label: "Brochures",
    href: "/category/postcards-flyers",
    columns: [
      {
        heading: "Marketing",
        items: [
          { label: "Postcards & Flyers", href: "/category/postcards-flyers" },
          { label: "Request a brochure quote", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Signs",
    href: "/category/signs-banners",
    columns: [
      {
        heading: "Outdoor Signs",
        items: [
          { label: "Corrugated Yard Signs", href: "/product/corrugated-yard-signs" },
          { label: "Shop all Signs & Banners", href: "/category/signs-banners" },
        ],
      },
    ],
  },
  {
    label: "Banners",
    href: "/category/signs-banners",
    columns: [
      {
        heading: "Banners",
        items: [
          { label: "Shop all Signs & Banners", href: "/category/signs-banners" },
          { label: "Request a banner quote", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Stickers",
    href: "/category/stickers-labels",
    columns: [
      {
        heading: "Custom Stickers",
        items: [
          { label: "Custom Die-Cut Stickers", href: "/product/custom-die-cut-stickers" },
          { label: "Shop all Stickers & Labels", href: "/category/stickers-labels" },
        ],
      },
    ],
  },
  {
    label: "Labels",
    href: "/category/stickers-labels",
    columns: [
      {
        heading: "Product Labels",
        items: [
          { label: "Shop all Stickers & Labels", href: "/category/stickers-labels" },
          { label: "Request a label quote", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Posters",
    href: "/category/signs-banners",
    columns: [
      {
        heading: "Posters",
        items: [
          { label: "Shop all Signs, Banners & Posters", href: "/category/signs-banners" },
          { label: "Request a poster quote", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Invitations",
    href: "/category/invitations-stationery",
    columns: [
      {
        heading: "Invitations & Stationery",
        items: [
          { label: "Shop all Invitations & Stationery", href: "/category/invitations-stationery" },
          { label: "Wedding", href: "/category/wedding" },
        ],
      },
    ],
  },
  {
    label: "Marketing Materials",
    href: "/category/postcards-flyers",
    columns: [
      {
        heading: "Marketing",
        items: [
          { label: "Postcards & Flyers", href: "/category/postcards-flyers" },
          { label: "Promotional Products", href: "/category/promo-products" },
          { label: "Custom Mailer Boxes", href: "/product/custom-mailer-boxes" },
        ],
      },
    ],
  },
  {
    label: "Office Materials",
    href: "/category/invitations-stationery",
    columns: [
      {
        heading: "Office",
        items: [
          { label: "Stationery & Letterheads", href: "/category/invitations-stationery" },
          { label: "Design Services", href: "/category/design-services" },
        ],
      },
    ],
  },
  {
    label: "Web Design",
    href: "/web-design-services",
    columns: [
      {
        heading: "Web Design Services",
        items: [
          { label: "Business websites", href: "/web-design-services" },
          { label: "Ecommerce websites", href: "/web-design-services" },
          { label: "Landing pages", href: "/web-design-services" },
          { label: "Website redesigns", href: "/web-design-services" },
          { label: "Request a quote", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Social Media",
    href: "/social-media-marketing-services",
    columns: [
      {
        heading: "Social Media Marketing",
        items: [
          { label: "Reels, TikToks & Shorts", href: "/social-media-marketing-services" },
          { label: "Product promo videos", href: "/social-media-marketing-services" },
          { label: "Ad creatives", href: "/social-media-marketing-services" },
          { label: "Content strategy", href: "/social-media-marketing-services" },
          { label: "Request help", href: "/quote" },
        ],
      },
    ],
  },
  {
    label: "Payment Processing & POS",
    href: "/payment-processing-pos",
    columns: [
      {
        heading: "Payments & POS",
        items: [
          { label: "Free POS systems", href: "/payment-processing-pos" },
          { label: "Countertop terminals", href: "/payment-processing-pos" },
          { label: "Wireless handhelds", href: "/payment-processing-pos" },
          { label: "Smart POS tablets", href: "/payment-processing-pos" },
          { label: "Get a free quote", href: "/quote" },
        ],
      },
    ],
  },
];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const { count: favoritesCount } = useFavorites();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchResults = searchQuery.length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Top Utility Bar */}
      <div className="bg-secondary text-secondary-foreground text-xs py-2 px-4 md:px-8 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Free File Review</span>
          <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Fast Nationwide Shipping</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/help" className="hover:text-primary transition-colors flex items-center gap-1"><Phone className="w-3 h-3" /> 1-800-OPEN-PRT</Link>
          <Link href="/help" className="hover:text-primary transition-colors">Help Center</Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            
            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-6 py-6">
                    <Link href="/" className="font-serif text-2xl font-bold text-primary tracking-tight">Open4Printing.</Link>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="What are you printing today?" className="pl-9 w-full bg-muted/50 border-transparent focus-visible:bg-background" />
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {NAV_GROUPS.map((group) => (
                        <AccordionItem key={group.label} value={group.label}>
                          <AccordionTrigger className="text-base font-semibold">{group.label}</AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-col gap-1 pl-4">
                              <Link href={group.href} className="py-2 text-sm font-semibold text-foreground hover:text-primary">
                                Shop all {group.label}
                              </Link>
                              {group.columns.flatMap((col) =>
                                col.items.map((item) => (
                                  <Link
                                    key={`${group.label}-${item.label}`}
                                    href={item.href}
                                    className="py-1.5 text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    {item.label}
                                  </Link>
                                )),
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <div className="flex flex-col gap-4 mt-auto">
                      <Link href="/upload" className="flex items-center gap-2 text-lg"><FileUp className="w-5 h-5" /> Upload Artwork</Link>
                      <Link href="/cart" className="flex items-center gap-2 text-lg"><ShoppingCart className="w-5 h-5" /> Cart ({itemCount})</Link>
                      <Link href="/help" className="flex items-center gap-2 text-lg"><HelpCircle className="w-5 h-5" /> Help Center</Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link href="/" className="font-serif text-2xl md:text-3xl font-black tracking-tighter text-foreground flex-shrink-0">
              Open<span className="text-primary">4</span>Printing.
            </Link>

            {/* Search (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl relative" onFocus={() => setIsSearchOpen(true)} onBlur={(e) => {
              // Delay closing to allow clicking results
              setTimeout(() => setIsSearchOpen(false), 200);
            }}>
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="What are you printing today? Try 'business cards' or 'banners'..." 
                  className="w-full pl-11 pr-4 py-6 text-base rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-primary shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.length > 1 && (
                <div className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden p-2">
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.slice(0, 5).map(product => (
                        <Link 
                          key={product.id} 
                          href={`/product/${product.slug}`}
                          className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors"
                        >
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {categories.find(c => c.id === product.categoryId)?.image ? (
                              <img src={categories.find(c => c.id === product.categoryId)?.image} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{product.shortDescription}</div>
                          </div>
                          <div className="ml-auto text-primary font-medium text-sm">
                            From ${product.startingPrice}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      No products found for "{searchQuery}". Try a different term.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
              <Link href="/upload" className="hidden lg:flex">
                <Button variant="ghost" className="font-medium hover:text-primary">
                  <FileUp className="w-4 h-4 mr-2" /> Upload
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
              
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="w-5 h-5" />
              </Button>

              <Link href="/cart">
                <Button variant="secondary" className="relative rounded-full px-4 h-12 font-medium">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Cart</span>
                  {itemCount > 0 && (
                    <Badge variant="default" className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center rounded-full border-2 border-background">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Nav (Desktop) — Sinalite-style mega dropdown */}
        <div className="hidden md:block border-t border-border">
          <div className="container mx-auto px-2 lg:px-4 relative">
            <nav className="flex items-center justify-center flex-wrap gap-x-0.5 lg:gap-x-1 gap-y-1 py-2 text-xs lg:text-sm font-medium">
              {NAV_GROUPS.map((group, idx) => {
                // Anchor panels to the side of the trigger that has the most room,
                // so the popup never overflows the viewport horizontally.
                const isFirstHalf = idx < NAV_GROUPS.length / 2;
                const panelAnchor = isFirstHalf ? "left-0" : "right-0";
                return (
                  <div key={group.label} className="relative group">
                    <Link
                      href={group.href}
                      className="inline-flex items-center gap-0.5 lg:gap-1 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors whitespace-nowrap"
                      data-testid={`nav-${group.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {group.label}
                      <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                    </Link>
                    {/* Mega panel — opens on hover OR keyboard focus, anchored to nearest viewport edge */}
                    <div
                      className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute ${panelAnchor} top-full z-40 pt-2`}
                    >
                      <div
                        className="bg-card border border-border shadow-2xl rounded-2xl p-4 lg:p-5 w-[440px] max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-border">
                          <div className="min-w-0">
                            <div className="font-serif text-base lg:text-lg font-bold text-foreground truncate">{group.label}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              Click any item to jump straight to its product page.
                            </div>
                          </div>
                          <Link
                            href={group.href}
                            className="text-xs lg:text-sm font-semibold text-primary hover:underline whitespace-nowrap shrink-0"
                          >
                            Shop all →
                          </Link>
                        </div>
                        <div className={`grid gap-3 lg:gap-4 ${group.columns.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                          {group.columns.map((col) => (
                            <div key={col.heading} className="min-w-0">
                              <div className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                {col.heading}
                              </div>
                              <ul className="flex flex-col gap-1.5">
                                {col.items.map((item) => (
                                  <li key={item.label}>
                                    <Link
                                      href={item.href}
                                      className="block text-xs lg:text-sm text-foreground/80 hover:text-primary transition-colors leading-snug"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-secondary-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link href="/" className="font-serif text-3xl font-black tracking-tighter text-white block mb-6">
                Open<span className="text-primary">4</span>Printing.
              </Link>
              <p className="text-secondary-foreground/70 mb-8 max-w-sm text-lg">
                Custom printing made simple, fast, and beautiful. Your premium partner for all things print.
              </p>
              <div className="flex flex-col gap-3 text-secondary-foreground/80">
                <span className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /> 1-800-OPEN-PRT</span>
                <span className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /> hello@open4printing.com</span>
                <span className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary" /> 123 Print Avenue, Maker City, NY</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Products</h4>
              <ul className="flex flex-col gap-4 text-secondary-foreground/70">
                <li><Link href="/category/business-cards" className="hover:text-primary transition-colors">Business Cards</Link></li>
                <li><Link href="/category/postcards-flyers" className="hover:text-primary transition-colors">Postcards & Flyers</Link></li>
                <li><Link href="/category/signs-banners" className="hover:text-primary transition-colors">Signs & Banners</Link></li>
                <li><Link href="/category/stickers-labels" className="hover:text-primary transition-colors">Stickers & Labels</Link></li>
                <li><Link href="/category/packaging" className="hover:text-primary transition-colors">Custom Packaging</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Company</h4>
              <ul className="flex flex-col gap-4 text-secondary-foreground/70">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Print Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Support</h4>
              <ul className="flex flex-col gap-4 text-secondary-foreground/70">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center / FAQ</Link></li>
                <li><Link href="/file-setup" className="hover:text-primary transition-colors">File Setup Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/upload" className="hover:text-primary transition-colors">Upload Artwork</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-secondary-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/50">
            <p>© {new Date().getFullYear()} Open4Printing. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
