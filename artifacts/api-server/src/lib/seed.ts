import { eq } from "drizzle-orm";
import { db, adminUsersTable, productsTable } from "@workspace/db";
import { hashPassword } from "./auth";
import { logger } from "./logger";

const DEFAULT_ADMIN_EMAIL = "admin@open4printing.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export async function seedAdminUser(): Promise<void> {
  const email = (process.env["ADMIN_EMAIL"] ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = process.env["ADMIN_PASSWORD"] ?? DEFAULT_ADMIN_PASSWORD;

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email));
  if (existing) {
    logger.info({ email }, "Admin user already exists");
    return;
  }
  const passwordHash = await hashPassword(password);
  await db.insert(adminUsersTable).values({ email, passwordHash, name: "Admin" });
  logger.info({ email }, "Seeded default admin user");
}

interface SeedProduct {
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  startingPrice: number;
}

const SEED_PRODUCTS: SeedProduct[] = [
  // Business Cards
  { slug: "standard-business-cards", name: "Standard Business Cards", categorySlug: "business-cards", shortDescription: "Classic 14pt cardstock — sharp, affordable, and ready in 2 days.", startingPrice: 19.99 },
  { slug: "premium-business-cards", name: "Premium Business Cards", categorySlug: "business-cards", shortDescription: "32pt thick stock with rich color and a confident hand-feel.", startingPrice: 39.99 },
  { slug: "matte-business-cards", name: "Matte Business Cards", categorySlug: "business-cards", shortDescription: "Soft, modern matte finish that's smudge-resistant and writable.", startingPrice: 24.99 },
  { slug: "glossy-business-cards", name: "Glossy Business Cards", categorySlug: "business-cards", shortDescription: "High-gloss UV coating that makes every color pop.", startingPrice: 24.99 },
  { slug: "square-business-cards", name: "Square Business Cards", categorySlug: "business-cards", shortDescription: "2.5\" square — distinctive shape that gets noticed.", startingPrice: 29.99 },
  { slug: "folded-business-cards", name: "Folded Business Cards", categorySlug: "business-cards", shortDescription: "Mini brochure in your pocket — twice the space to tell your story.", startingPrice: 34.99 },
  // Postcards & Print Advertising
  { slug: "postcards", name: "Postcards", categorySlug: "postcards-print-advertising", shortDescription: "Direct-mail ready postcards in standard and custom sizes.", startingPrice: 49.99 },
  { slug: "flyers", name: "Flyers", categorySlug: "postcards-print-advertising", shortDescription: "Eye-catching flyers on premium 100lb gloss text.", startingPrice: 39.99 },
  { slug: "brochures", name: "Brochures", categorySlug: "postcards-print-advertising", shortDescription: "Tri-fold or bi-fold brochures with crisp scoring.", startingPrice: 79.99 },
  { slug: "door-hangers", name: "Door Hangers", categorySlug: "postcards-print-advertising", shortDescription: "Sturdy 14pt door hangers with die-cut hole.", startingPrice: 59.99 },
  { slug: "rack-cards", name: "Rack Cards", categorySlug: "postcards-print-advertising", shortDescription: "4x9\" rack cards perfect for hotels, lobbies, and tradeshows.", startingPrice: 44.99 },
  { slug: "menus", name: "Menus", categorySlug: "postcards-print-advertising", shortDescription: "Restaurant menus printed on water-resistant stock.", startingPrice: 89.99 },
  { slug: "presentation-folders", name: "Presentation Folders", categorySlug: "postcards-print-advertising", shortDescription: "Pocket folders with optional business card slot.", startingPrice: 119.99 },
  // Signs, Banners & Posters
  { slug: "coroplast-yard-signs", name: "Coroplast Yard Signs", categorySlug: "signs-banners-posters", shortDescription: "Weatherproof corrugated plastic — H-stake included.", startingPrice: 14.99 },
  { slug: "acrylic-signs", name: "Acrylic Signs", categorySlug: "signs-banners-posters", shortDescription: "3/16\" thick clear acrylic with full-color print.", startingPrice: 79.99 },
  { slug: "foam-core-signs", name: "Foam Core Signs", categorySlug: "signs-banners-posters", shortDescription: "Lightweight foam board — perfect for indoor signage.", startingPrice: 24.99 },
  { slug: "aluminum-signs", name: "Aluminum Signs", categorySlug: "signs-banners-posters", shortDescription: "Heavy-duty aluminum for outdoor signage built to last.", startingPrice: 44.99 },
  { slug: "pvc-signs", name: "PVC Signs", categorySlug: "signs-banners-posters", shortDescription: "Smooth, durable PVC in 3mm and 6mm thicknesses.", startingPrice: 29.99 },
  { slug: "banners", name: "Vinyl Banners", categorySlug: "signs-banners-posters", shortDescription: "13oz scrim vinyl with hemmed edges and grommets.", startingPrice: 24.99 },
  { slug: "retractable-banners", name: "Retractable Banners", categorySlug: "signs-banners-posters", shortDescription: "Pull-up display with carry case — set up in seconds.", startingPrice: 89.99 },
  { slug: "posters", name: "Posters", categorySlug: "signs-banners-posters", shortDescription: "High-resolution posters on satin or matte stock.", startingPrice: 19.99 },
  { slug: "window-graphics", name: "Window Graphics", categorySlug: "signs-banners-posters", shortDescription: "Storefront window decals and clings.", startingPrice: 34.99 },
  { slug: "real-estate-signs", name: "Real Estate Signs", categorySlug: "signs-banners-posters", shortDescription: "Open-house and for-sale signs with frame option.", startingPrice: 19.99 },
  // Stickers & Labels
  { slug: "custom-stickers", name: "Custom Stickers", categorySlug: "stickers-labels", shortDescription: "Die-cut vinyl stickers in any shape.", startingPrice: 9.99 },
  { slug: "product-labels", name: "Product Labels", categorySlug: "stickers-labels", shortDescription: "Premium product labels for retail packaging.", startingPrice: 29.99 },
  { slug: "roll-labels", name: "Roll Labels", categorySlug: "stickers-labels", shortDescription: "Labels on a roll — ideal for high-volume runs.", startingPrice: 49.99 },
  { slug: "circle-stickers", name: "Circle Stickers", categorySlug: "stickers-labels", shortDescription: "Round vinyl stickers in a range of sizes.", startingPrice: 9.99 },
  { slug: "square-stickers", name: "Square Stickers", categorySlug: "stickers-labels", shortDescription: "Square vinyl stickers, glossy or matte.", startingPrice: 9.99 },
  { slug: "waterproof-labels", name: "Waterproof Labels", categorySlug: "stickers-labels", shortDescription: "Bottle-ready waterproof labels with strong adhesive.", startingPrice: 39.99 },
  // Clothing & Bags
  { slug: "t-shirts", name: "Custom T-Shirts", categorySlug: "clothing-bags", shortDescription: "Soft-style tees, screen-printed or DTG.", startingPrice: 14.99 },
  { slug: "hoodies", name: "Hoodies", categorySlug: "clothing-bags", shortDescription: "Heavyweight pullover hoodies in 12 colors.", startingPrice: 34.99 },
  { slug: "tote-bags", name: "Tote Bags", categorySlug: "clothing-bags", shortDescription: "Cotton totes printed with your design.", startingPrice: 9.99 },
  { slug: "caps", name: "Caps", categorySlug: "clothing-bags", shortDescription: "Embroidered or printed caps and hats.", startingPrice: 19.99 },
  { slug: "aprons", name: "Aprons", categorySlug: "clothing-bags", shortDescription: "Durable bib aprons for restaurants and shops.", startingPrice: 16.99 },
  // Promotional Products
  { slug: "pens", name: "Pens", categorySlug: "promotional-products", shortDescription: "Imprinted pens — your logo, in their hand.", startingPrice: 39.99 },
  { slug: "mugs", name: "Mugs", categorySlug: "promotional-products", shortDescription: "11oz ceramic mugs with full-wrap printing.", startingPrice: 8.99 },
  { slug: "keychains", name: "Keychains", categorySlug: "promotional-products", shortDescription: "Custom keychains in metal or acrylic.", startingPrice: 4.99 },
  { slug: "notebooks", name: "Notebooks", categorySlug: "promotional-products", shortDescription: "Branded notebooks for events and onboarding.", startingPrice: 7.99 },
  { slug: "tumblers", name: "Tumblers", categorySlug: "promotional-products", shortDescription: "Insulated stainless-steel tumblers.", startingPrice: 14.99 },
  { slug: "magnets", name: "Magnets", categorySlug: "promotional-products", shortDescription: "Refrigerator and car magnets in any shape.", startingPrice: 19.99 },
  // Packaging
  { slug: "custom-boxes", name: "Custom Boxes", categorySlug: "packaging", shortDescription: "Branded shipping and product boxes.", startingPrice: 99.99 },
  { slug: "mailer-boxes", name: "Mailer Boxes", categorySlug: "packaging", shortDescription: "Subscription-ready mailer boxes.", startingPrice: 89.99 },
  { slug: "product-packaging", name: "Product Packaging", categorySlug: "packaging", shortDescription: "Retail-ready folding cartons and sleeves.", startingPrice: 119.99 },
  { slug: "thank-you-cards-pkg", name: "Thank You Cards", categorySlug: "packaging", shortDescription: "Custom thank-you inserts for shipments.", startingPrice: 19.99 },
  { slug: "packaging-labels", name: "Packaging Labels", categorySlug: "packaging", shortDescription: "Address and brand labels for outbound packages.", startingPrice: 24.99 },
  // Invitations, Gifts & Stationery
  { slug: "invitations", name: "Invitations", categorySlug: "invitations-gifts-stationery", shortDescription: "Beautifully printed invitations for any event.", startingPrice: 29.99 },
  { slug: "greeting-cards", name: "Greeting Cards", categorySlug: "invitations-gifts-stationery", shortDescription: "Folded greeting cards with envelopes.", startingPrice: 24.99 },
  { slug: "thank-you-cards", name: "Thank You Cards", categorySlug: "invitations-gifts-stationery", shortDescription: "Premium thank-you cards with envelopes.", startingPrice: 19.99 },
  { slug: "notepads", name: "Notepads", categorySlug: "invitations-gifts-stationery", shortDescription: "Glue-bound notepads, branded or personal.", startingPrice: 14.99 },
  { slug: "letterhead", name: "Letterhead", categorySlug: "invitations-gifts-stationery", shortDescription: "Professional letterhead on premium paper.", startingPrice: 39.99 },
  { slug: "envelopes", name: "Envelopes", categorySlug: "invitations-gifts-stationery", shortDescription: "Branded envelopes in standard sizes.", startingPrice: 29.99 },
  // Wedding
  { slug: "wedding-invitations", name: "Wedding Invitations", categorySlug: "wedding", shortDescription: "Curated wedding invitation suites.", startingPrice: 79.99 },
  { slug: "save-the-dates", name: "Save the Dates", categorySlug: "wedding", shortDescription: "Save-the-date cards and magnets.", startingPrice: 49.99 },
  { slug: "wedding-menus", name: "Wedding Menus", categorySlug: "wedding", shortDescription: "Reception menus that match your suite.", startingPrice: 39.99 },
  { slug: "seating-charts", name: "Seating Charts", categorySlug: "wedding", shortDescription: "Large-format seating charts on foam board.", startingPrice: 49.99 },
  { slug: "welcome-signs", name: "Welcome Signs", categorySlug: "wedding", shortDescription: "Acrylic or foam welcome signs for your big day.", startingPrice: 59.99 },
  { slug: "wedding-thank-you-cards", name: "Wedding Thank You Cards", categorySlug: "wedding", shortDescription: "Match your wedding suite with custom thank-yous.", startingPrice: 39.99 },
  // Logo, Websites & Social
  { slug: "logo-design", name: "Logo Design", categorySlug: "logo-websites-social", shortDescription: "Brand-defining logo design from our studio.", startingPrice: 199.99 },
  { slug: "social-media-graphics", name: "Social Media Graphics", categorySlug: "logo-websites-social", shortDescription: "Custom Instagram, LinkedIn, and Facebook graphics.", startingPrice: 79.99 },
  { slug: "website-design", name: "Website Design", categorySlug: "logo-websites-social", shortDescription: "Modern, mobile-friendly websites for small business.", startingPrice: 999.99 },
  { slug: "brand-kits", name: "Brand Kits", categorySlug: "logo-websites-social", shortDescription: "Complete brand kit: logo, palette, fonts, guidelines.", startingPrice: 499.99 },
  { slug: "digital-business-cards", name: "Digital Business Cards", categorySlug: "logo-websites-social", shortDescription: "Tap-to-share digital business cards with NFC.", startingPrice: 29.99 },
  // Design Services
  { slug: "print-design-help", name: "Print Design Help", categorySlug: "design-services", shortDescription: "Hourly help from our print-design experts.", startingPrice: 49.99 },
  { slug: "logo-design-help", name: "Logo Design Help", categorySlug: "design-services", shortDescription: "Logo refinement and adaptation services.", startingPrice: 79.99 },
  { slug: "file-setup", name: "File Setup", categorySlug: "design-services", shortDescription: "We'll prep your file for press at the right size and bleed.", startingPrice: 19.99 },
  { slug: "artwork-fixing", name: "Artwork Fixing", categorySlug: "design-services", shortDescription: "Repair low-res or damaged artwork before printing.", startingPrice: 29.99 },
  { slug: "custom-design-request", name: "Custom Design Request", categorySlug: "design-services", shortDescription: "Tell us what you need — we'll design it from scratch.", startingPrice: 149.99 },
];

export async function seedProducts(): Promise<void> {
  let inserted = 0;
  for (const p of SEED_PRODUCTS) {
    await db
      .insert(productsTable)
      .values({
        slug: p.slug,
        name: p.name,
        categorySlug: p.categorySlug,
        shortDescription: p.shortDescription,
        startingPrice: p.startingPrice.toFixed(2),
        enabled: true,
      })
      .onConflictDoNothing({ target: productsTable.slug });
    inserted++;
  }
  logger.info({ count: inserted }, "Seeded products");
}

export async function runSeeds(): Promise<void> {
  try {
    await seedAdminUser();
    await seedProducts();
  } catch (err) {
    logger.error({ err }, "Seeding failed");
  }
}
