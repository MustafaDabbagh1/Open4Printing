export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  startingPrice: number;
  isPopular?: boolean;
  isOnSale?: boolean;
  image?: string;
  materialOptions?: string[];
  sizeOptions?: string[];
  finishOptions?: string[];
  turnaroundOptions?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
}

export const categories: Category[] = [
  { id: "deals", name: "Deals", slug: "deals", shortDescription: "Save big on our most popular printed products.", image: "/images/cat-postcards.png" },
  { id: "business-cards", name: "Business Cards", slug: "business-cards", shortDescription: "Make a lasting impression with premium cards.", image: "/images/cat-business-cards.png" },
  { id: "postcards-flyers", name: "Postcards & Print Advertising", slug: "postcards-flyers", shortDescription: "Spread the word with vibrant printed materials.", image: "/images/cat-postcards.png" },
  { id: "signs-banners", name: "Signs, Banners & Posters", slug: "signs-banners", shortDescription: "Go big and get noticed from a distance.", image: "/images/cat-signs.png" },
  { id: "stickers-labels", name: "Stickers & Labels", slug: "stickers-labels", shortDescription: "Custom die-cut stickers and product roll labels.", image: "/images/cat-stickers.png" },
  { id: "clothing-bags", name: "Clothing & Bags", slug: "clothing-bags", shortDescription: "High quality custom apparel and accessories.", image: "/images/cat-clothing.png" },
  { id: "promo-products", name: "Promotional Products", slug: "promo-products", shortDescription: "Mugs, pens, and gifts with your brand.", image: "/images/cat-promo.png" },
  { id: "packaging", name: "Packaging", slug: "packaging", shortDescription: "Custom boxes and mailers for a premium unboxing.", image: "/images/cat-packaging.png" },
  { id: "invitations-stationery", name: "Invitations & Stationery", slug: "invitations-stationery", shortDescription: "Elegant greeting cards, letterheads and more.", image: "/images/cat-wedding.png" },
  { id: "wedding", name: "Wedding", slug: "wedding", shortDescription: "Beautiful invitations, menus, and signage.", image: "/images/cat-wedding.png" },
  { id: "digital", name: "Logo, Websites & Social", slug: "digital", shortDescription: "Digital branding packages and web design.", image: "/images/cat-design.png" },
  { id: "design-services", name: "Design Services", slug: "design-services", shortDescription: "Let our experts set up your files or create from scratch.", image: "/images/cat-design.png" },
];

export const products: Product[] = [
  // Business Cards
  {
    id: "bc-std",
    name: "Standard Business Cards",
    slug: "standard-business-cards",
    categoryId: "business-cards",
    shortDescription: "Our classic 14pt cardstock. Reliable and professional.",
    startingPrice: 14.99,
    isPopular: true,
    sizeOptions: ["2\" x 3.5\" (US Standard)", "2.12\" x 3.38\" (Euro Standard)"],
    materialOptions: ["14pt Matte", "14pt Gloss", "16pt Premium Matte"],
    turnaroundOptions: ["3 Business Days", "Next Day (+ $10)"]
  },
  {
    id: "bc-prem",
    name: "Premium Soft Touch Cards",
    slug: "premium-soft-touch-cards",
    categoryId: "business-cards",
    shortDescription: "Ultra-thick 16pt cardstock with a velvety soft-touch finish.",
    startingPrice: 29.99,
    isPopular: true,
    sizeOptions: ["2\" x 3.5\" (US Standard)"],
    materialOptions: ["16pt Soft Touch", "18pt Soft Touch"],
    turnaroundOptions: ["3 Business Days", "Next Day (+ $15)"]
  },
  
  // Postcards
  {
    id: "pc-std",
    name: "Standard Postcards",
    slug: "standard-postcards",
    categoryId: "postcards-flyers",
    shortDescription: "Perfect for mailers, handouts, and inserts.",
    startingPrice: 19.99,
    isPopular: true,
    isOnSale: true,
    sizeOptions: ["4\" x 6\"", "5\" x 7\"", "6\" x 9\""],
    materialOptions: ["14pt Matte", "14pt Gloss"],
    turnaroundOptions: ["3 Business Days", "Next Day (+ $10)"]
  },

  // Signs
  {
    id: "sg-yard",
    name: "Corrugated Yard Signs",
    slug: "corrugated-yard-signs",
    categoryId: "signs-banners",
    shortDescription: "Weatherproof 4mm coroplast. Includes H-stakes.",
    startingPrice: 12.50,
    isPopular: true,
    sizeOptions: ["18\" x 24\"", "24\" x 36\""],
    materialOptions: ["4mm Coroplast"],
    finishOptions: ["Single Sided", "Double Sided (+ $5)"],
    turnaroundOptions: ["2 Business Days", "Next Day (+ $20)"]
  },

  // Stickers
  {
    id: "st-diecut",
    name: "Custom Die-Cut Stickers",
    slug: "custom-die-cut-stickers",
    categoryId: "stickers-labels",
    shortDescription: "Thick, durable vinyl protects from scratching, rain & sunlight.",
    startingPrice: 35.00,
    isPopular: true,
    isOnSale: true,
    sizeOptions: ["2\" x 2\"", "3\" x 3\"", "4\" x 4\""],
    materialOptions: ["White Vinyl", "Clear Vinyl", "Holographic"],
    finishOptions: ["Matte", "Glossy"],
    turnaroundOptions: ["3 Business Days"]
  },

  // Apparel
  {
    id: "ap-tee",
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-t-shirt",
    categoryId: "clothing-bags",
    shortDescription: "100% combed ring-spun cotton. Soft and durable.",
    startingPrice: 18.00,
    isPopular: true,
    sizeOptions: ["S", "M", "L", "XL", "2XL", "3XL"],
    materialOptions: ["White", "Black", "Navy", "Heather Grey"],
    turnaroundOptions: ["5 Business Days", "3 Business Days (+ $20)"]
  },

  // Packaging
  {
    id: "pk-mailer",
    name: "Custom Mailer Boxes",
    slug: "custom-mailer-boxes",
    categoryId: "packaging",
    shortDescription: "Sturdy corrugated cardboard boxes that make unboxing an experience.",
    startingPrice: 150.00,
    sizeOptions: ["6\" x 6\" x 2\"", "9\" x 6\" x 3\"", "12\" x 9\" x 4\""],
    materialOptions: ["Kraft Corrugated", "White Corrugated"],
    finishOptions: ["Standard Print", "Premium Gloss Varnish"],
    turnaroundOptions: ["7-10 Business Days"]
  }
];
