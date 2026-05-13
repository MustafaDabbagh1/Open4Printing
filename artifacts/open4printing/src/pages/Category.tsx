import { useSeo } from "@/hooks/use-seo";
import { categories, products } from "@/data/products";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ChevronRight, Package, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const category = categories.find(c => c.slug === slug) || categories[0];
  useSeo({ title: category.name, description: category.shortDescription });

  // If "deals", show all sale products, otherwise show category products
  const categoryProducts = category.id === "deals" 
    ? products.filter(p => p.isOnSale)
    : products.filter(p => p.categoryId === category.id);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Slim breadcrumb + title (no hero/background image) */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground font-medium overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground shrink-0">{category.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-foreground mb-2">
            {category.name}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            {category.shortDescription}
          </p>
        </div>

        {/* Filters strip (Visual only for now) */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-4 border-b border-border">
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-2">Filter by:</span>
          <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">All Types</Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors bg-background">Standard Size</Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors bg-background">Premium Material</Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors bg-background">Quick Ship</Badge>
          
          <div className="ml-auto text-sm font-medium text-muted-foreground">
            Showing {categoryProducts.length} products
          </div>
        </div>

        {/* Product Grid — compact cards (≈3× smaller) */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {categoryProducts.map((product, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                key={product.id}
                className="group relative flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                  {product.isOnSale && (
                    <Badge variant="destructive" className="px-2 py-0.5 text-[10px] shadow">SALE</Badge>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                    className={`h-9 w-9 md:h-8 md:w-8 rounded-full shadow backdrop-blur-md bg-white/80 hover:bg-white ${isFavorite(product.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <Link href={`/product/${product.slug}`} className="relative aspect-square bg-muted overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {categories.find(c => c.id === product.categoryId)?.image ? (
                    <img
                      src={categories.find(c => c.id === product.categoryId)?.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                <div className="p-3 flex flex-col flex-1 bg-card">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-sm font-bold font-serif mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2 leading-snug">{product.shortDescription}</p>

                  <div className="flex items-end justify-between mt-auto gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From</div>
                      <div className="text-base font-black leading-none">${product.startingPrice.toFixed(2)}</div>
                    </div>
                    <Button
                      onClick={() => setLocation(`/product/${product.slug}`)}
                      size="sm"
                      className="h-9 md:h-8 rounded-full px-3 text-xs font-semibold shadow-sm hover-elevate"
                    >
                      Shop
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold font-serif mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">We're adding new products to this category soon.</p>
            <Button onClick={() => setLocation('/')} variant="outline" className="rounded-full">Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
}
