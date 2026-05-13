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

        {/* Product Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {categoryProducts.map((product, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                key={product.id}
                className="group relative flex flex-col bg-card rounded-[2rem] border border-border shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {product.isOnSale && (
                    <Badge variant="destructive" className="px-3 py-1 shadow-md">SALE</Badge>
                  )}
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className={`rounded-full shadow-md backdrop-blur-md bg-white/80 hover:bg-white ${isFavorite(product.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <Link href={`/product/${product.slug}`} className="relative h-72 md:h-80 bg-muted overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {categories.find(c => c.id === product.categoryId)?.image ? (
                    <img 
                      src={categories.find(c => c.id === product.categoryId)?.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <Package className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </Link>
                
                <div className="p-8 flex flex-col flex-1 relative bg-card">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-2xl font-bold font-serif mb-3 group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-muted-foreground mb-8 line-clamp-2 text-lg flex-1">{product.shortDescription}</p>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Starting at</div>
                      <div className="text-3xl font-black">${product.startingPrice.toFixed(2)}</div>
                    </div>
                    <Button 
                      onClick={() => setLocation(`/product/${product.slug}`)}
                      className="rounded-full px-6 py-6 font-bold shadow-md hover-elevate transition-all"
                    >
                      Shop Now
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
