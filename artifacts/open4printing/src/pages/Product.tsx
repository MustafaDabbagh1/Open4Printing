import { useState, useMemo } from "react";
import { useSeo } from "@/hooks/use-seo";
import { categories, products } from "@/data/products";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Upload, Info, Check, Image as ImageIcon, ShieldCheck, Clock, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find(p => p.slug === slug);
  const category = product ? categories.find(c => c.id === product.categoryId) : null;
  const { addToCart } = useCart();
  const { toast } = useToast();

  useSeo({ title: product?.name || "Product Not Found", description: product?.shortDescription });

  // Configurator State
  const [size, setSize] = useState(product?.sizeOptions?.[0] || "");
  const [material, setMaterial] = useState(product?.materialOptions?.[0] || "");
  const [finish, setFinish] = useState(product?.finishOptions?.[0] || "");
  const [turnaround, setTurnaround] = useState(product?.turnaroundOptions?.[0] || "");
  const [quantity, setQuantity] = useState("100");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Simple pricing formula
  const estimatedPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.startingPrice;
    
    // Quantity multiplier
    const qtyNum = parseInt(quantity, 10) || 100;
    price = price * (qtyNum / 100);

    // Size multiplier (just dummy logic based on index)
    const sizeIdx = product.sizeOptions?.indexOf(size) || 0;
    if (sizeIdx > 0) price *= (1 + (sizeIdx * 0.2));

    // Material multiplier
    const matIdx = product.materialOptions?.indexOf(material) || 0;
    if (matIdx > 0) price *= (1 + (matIdx * 0.15));

    // Finish multiplier
    const finIdx = product.finishOptions?.indexOf(finish) || 0;
    if (finIdx > 0) price += (finIdx * 10);

    // Turnaround
    if (turnaround.includes("Next Day")) price += 20;

    return price;
  }, [product, size, material, finish, turnaround, quantity]);

  if (!product || !category) {
    return <div className="container py-24 text-center text-2xl font-serif">Product not found.</div>;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast({
        title: "File attached",
        description: `${e.target.files[0].name} is ready for review.`,
      });
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      unitPrice: estimatedPrice,
      quantity: 1, // The "quantity" in options refers to print quantity per item, cart qty is 1 set
      fileName: file?.name,
      options: {
        "Print Quantity": quantity,
        "Size": size,
        ...(material && { "Material": material }),
        ...(finish && { "Finish": finish }),
        "Turnaround": turnaround,
        ...(notes && { "Notes": notes })
      }
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="flex flex-col pb-24 bg-background">
      {/* Breadcrumb Header */}
      <div className="bg-muted/30 border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center gap-2 text-sm text-muted-foreground font-medium overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href={`/category/${category.slug}`} className="hover:text-primary transition-colors shrink-0">{category.name}</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground shrink-0">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column - Gallery */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm aspect-square md:aspect-[4/3] relative"
            >
              {category.image ? (
                <img src={category.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                  <ImageIcon className="w-20 h-20 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Image preview not available</p>
                </div>
              )}
              {product.isOnSale && (
                <div className="absolute top-6 left-6 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  Special Offer
                </div>
              )}
            </motion.div>

            {/* Thumbnail strip (mock) */}
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className={`aspect-square rounded-2xl border-2 overflow-hidden ${i === 1 ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100 cursor-pointer'} transition-all`}>
                  {category.image ? (
                    <img src={category.image} alt={`${product.name} view ${i}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
              ))}
            </div>

            {/* Product Trust Strip */}
            <div className="mt-8 p-8 bg-primary/5 rounded-3xl border border-primary/10">
              <h3 className="font-serif text-2xl font-bold mb-6">Why print with us?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Quality Guarantee</h4>
                    <p className="text-sm text-muted-foreground">If you're not thrilled with the print quality, we'll reprint it for free.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Free File Review</h4>
                    <p className="text-sm text-muted-foreground">Human experts check your files for bleed, resolution, and color.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Configurator */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="sticky top-24 bg-card rounded-[2rem] border border-border shadow-xl p-8 md:p-10 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight mb-3">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{product.shortDescription}</p>

              <div className="space-y-8 flex-1">
                {/* Quantity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-bold">Print Quantity</Label>
                  </div>
                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger className="h-14 text-lg rounded-xl bg-muted/50 border-transparent focus:bg-background">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {["50", "100", "250", "500", "1000", "2500", "5000"].map(q => (
                        <SelectItem key={q} value={q} className="text-lg">{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Options */}
                {product.sizeOptions && product.sizeOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Size</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.sizeOptions.map((opt) => (
                        <div 
                          key={opt}
                          className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${size === opt ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}
                          onClick={() => setSize(opt)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{opt}</span>
                            {size === opt && <Check className="w-5 h-5 text-primary" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Material Options */}
                {product.materialOptions && product.materialOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Paper / Material</Label>
                    <RadioGroup value={material} onValueChange={setMaterial} className="gap-3">
                      {product.materialOptions.map((opt) => (
                        <div key={opt} className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${material === opt ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setMaterial(opt)}>
                          <RadioGroupItem value={opt} id={`mat-${opt}`} className={material === opt ? "border-primary text-primary" : ""} />
                          <Label htmlFor={`mat-${opt}`} className="cursor-pointer font-medium text-base flex-1">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Turnaround Options */}
                {product.turnaroundOptions && product.turnaroundOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Turnaround Time</Label>
                    <RadioGroup value={turnaround} onValueChange={setTurnaround} className="gap-3">
                      {product.turnaroundOptions.map((opt) => (
                        <div key={opt} className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${turnaround === opt ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setTurnaround(opt)}>
                          <RadioGroupItem value={opt} id={`turn-${opt}`} />
                          <div className="flex-1 flex justify-between items-center cursor-pointer">
                            <Label htmlFor={`turn-${opt}`} className="cursor-pointer font-medium text-base">{opt}</Label>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Artwork Upload */}
                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-bold">Artwork</Label>
                    <Link href="/help" className="text-sm text-primary hover:underline flex items-center gap-1">Need design help?</Link>
                  </div>
                  
                  {!file ? (
                    <div className="relative border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl p-8 text-center hover:bg-primary/10 transition-colors cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleFileUpload}
                        accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.svg,.eps"
                      />
                      <Upload className="w-10 h-10 text-primary mx-auto mb-4" />
                      <div className="font-bold text-lg mb-1">Click or drag to upload</div>
                      <p className="text-sm text-muted-foreground">PDF, PSD, AI, PNG accepted</p>
                    </div>
                  ) : (
                    <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold truncate">{file.name}</div>
                          <div className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for review</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">Remove</Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground flex items-start gap-2 mt-2">
                    <Info className="w-4 h-4 shrink-0" /> We manually review every file before printing to ensure perfect results.
                  </p>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="mt-10 pt-8 border-t border-border sticky bottom-0 bg-card z-10 pb-4">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Estimated Total</div>
                    <div className="text-5xl font-black text-foreground">${estimatedPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground mt-1">For {quantity} pieces</div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full h-16 text-xl rounded-2xl shadow-xl hover-elevate transition-all"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Accordions */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-[2rem] border border-border px-8 py-4 shadow-sm">
            <AccordionItem value="item-1" className="border-b border-border">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary">How do I prepare my files for print?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                For the best results, we recommend submitting vector PDF files with all fonts outlined. Ensure your document is in CMYK color mode and includes at least a 0.125" bleed on all sides. Images should be 300 DPI at actual size.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-border">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary">What happens after I place my order?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                Our pre-press team will review your files within 4 business hours. If everything looks perfect, we'll send it straight to production. If we spot any issues (like low resolution or missing bleeds), we'll pause the order and email you immediately to resolve it.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-none">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary">Can you help me design it?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                Absolutely! We have a team of professional graphic designers ready to help. You can place your order without artwork and click "Request Design Help", or contact us directly. Design services are billed separately based on project complexity.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
