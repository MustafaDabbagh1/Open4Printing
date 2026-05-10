import { useState, useMemo } from "react";
import { useSeo } from "@/hooks/use-seo";
import { categories, products } from "@/data/products";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Upload, Info, Check, Image as ImageIcon, ShieldCheck, Clock, Zap, X, RefreshCw, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import BusinessCardPreview from "@/components/BusinessCardPreview";
import { uploadFile, ACCEPT_FILE_TYPES, isAllowedFile, formatFileSize, fileExtension } from "@/lib/api";
import type { CartFile } from "@/hooks/use-cart";
import { useGetPublicProduct, getGetPublicProductQueryKey } from "@workspace/api-client-react";

const MIN_DIMENSION_PX = 600;

interface UploadedSlot {
  file: File;
  uploaded?: { id: number; fileType: string; fileSize: number };
  uploading: boolean;
  error?: string;
  warning?: string;
  width?: number;
  height?: number;
}

async function checkImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return null;
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const category = product ? categories.find((c) => c.id === product.categoryId) : null;
  const { addToCart } = useCart();
  const { toast } = useToast();

  const apiProduct = useGetPublicProduct(slug ?? "", {
    query: { queryKey: getGetPublicProductQueryKey(slug ?? ""), enabled: Boolean(slug), retry: false },
  });
  const uploadConfig = apiProduct.data?.uploadConfig;

  useSeo({ title: product?.name || "Product Not Found", description: product?.shortDescription });

  const [size, setSize] = useState(product?.sizeOptions?.[0] || "");
  const [material, setMaterial] = useState(product?.materialOptions?.[0] || "");
  const [finish, setFinish] = useState(product?.finishOptions?.[0] || "");
  const [turnaround, setTurnaround] = useState(product?.turnaroundOptions?.[0] || "");
  const [quantity, setQuantity] = useState("100");
  const [notes, setNotes] = useState("");
  const [frontSlot, setFrontSlot] = useState<UploadedSlot | null>(null);
  const [backSlot, setBackSlot] = useState<UploadedSlot | null>(null);

  const isBusinessCard = product?.categoryId === "business-cards";
  const allowsBackUpload = uploadConfig?.allowsBackUpload ?? isBusinessCard;
  const artworkRequired = uploadConfig?.artworkRequired ?? isBusinessCard;

  const estimatedPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.startingPrice;
    const qtyNum = parseInt(quantity, 10) || 100;
    price = price * (qtyNum / 100);
    const sizeIdx = product.sizeOptions?.indexOf(size) || 0;
    if (sizeIdx > 0) price *= 1 + sizeIdx * 0.2;
    const matIdx = product.materialOptions?.indexOf(material) || 0;
    if (matIdx > 0) price *= 1 + matIdx * 0.15;
    const finIdx = product.finishOptions?.indexOf(finish) || 0;
    if (finIdx > 0) price += finIdx * 10;
    if (turnaround.includes("Next Day")) price += 20;
    return price;
  }, [product, size, material, finish, turnaround, quantity]);

  if (!product || !category) {
    return <div className="container py-24 text-center text-2xl font-serif">Product not found.</div>;
  }

  const handlePickFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back" | undefined,
    setter: (s: UploadedSlot | null) => void,
  ) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (!isAllowedFile(picked.name)) {
      toast({
        title: "Unsupported file type",
        description: "Allowed formats: PDF, PNG, JPG, JPEG, SVG, EPS, AI, PSD.",
        variant: "destructive",
      });
      return;
    }
    setter({ file: picked, uploading: true });

    const dims = await checkImageDimensions(picked);
    let warning: string | undefined;
    if (dims && (dims.width < MIN_DIMENSION_PX || dims.height < MIN_DIMENSION_PX)) {
      warning = `Low resolution: ${dims.width}×${dims.height}px. We recommend at least ${MIN_DIMENSION_PX}px on the shorter side for crisp printing.`;
      toast({ title: "Low-resolution warning", description: warning, variant: "destructive" });
    }

    try {
      const result = await uploadFile(picked, side);
      setter({
        file: picked,
        uploading: false,
        uploaded: { id: result.id, fileType: result.fileType, fileSize: result.fileSize },
        ...(warning ? { warning } : {}),
        ...(dims ? { width: dims.width, height: dims.height } : {}),
      });
      toast({
        title: "File uploaded",
        description: `${picked.name} (${formatFileSize(picked.size)}) is ready.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      setter({ file: picked, uploading: false, error: message });
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    }
  };

  const slotToCartFile = (slot: UploadedSlot | null, side?: "front" | "back"): CartFile | null => {
    if (!slot || !slot.uploaded) return null;
    return {
      id: slot.uploaded.id,
      name: slot.file.name,
      size: slot.uploaded.fileSize,
      type: slot.uploaded.fileType || fileExtension(slot.file.name),
      ...(side ? { side } : {}),
    };
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (artworkRequired && (!frontSlot || !frontSlot.uploaded)) {
      toast({
        title: "Artwork required",
        description: isBusinessCard
          ? "Please upload a front-side artwork file for your business cards before adding to cart."
          : "This product requires an uploaded artwork file before checkout.",
        variant: "destructive",
      });
      return;
    }
    if (frontSlot?.uploading || backSlot?.uploading) {
      toast({ title: "Upload still in progress", description: "Please wait for your file upload to finish." });
      return;
    }
    const files: CartFile[] = [];
    if (allowsBackUpload) {
      const f = slotToCartFile(frontSlot, "front");
      const b = slotToCartFile(backSlot, "back");
      if (f) files.push(f);
      if (b) files.push(b);
    } else {
      const f = slotToCartFile(frontSlot);
      if (f) files.push(f);
    }

    const primary = files[0];
    addToCart({
      productId: product.id,
      name: product.name,
      unitPrice: estimatedPrice,
      quantity: 1,
      isBusinessCard,
      files,
      ...(primary ? { fileName: primary.name, uploadedFileId: primary.id } : {}),
      options: {
        "Print Quantity": quantity,
        Size: size,
        ...(material && { Material: material }),
        ...(finish && { Finish: finish }),
        Turnaround: turnaround,
        ...(allowsBackUpload && backSlot?.uploaded ? { "Has Back Side": "Yes" } : {}),
        ...(notes && { Notes: notes }),
      },
    });

    toast({ title: "Added to cart!", description: `${product.name} has been added to your cart.` });
  };

  return (
    <div className="flex flex-col pb-24 bg-background">
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
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm aspect-square md:aspect-[4/3] relative">
              {category.image ? (
                <img src={category.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                  <ImageIcon className="w-20 h-20 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Image preview not available</p>
                </div>
              )}
              {product.isOnSale && (
                <div className="absolute top-6 left-6 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">Special Offer</div>
              )}
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`aspect-square rounded-2xl border-2 overflow-hidden ${i === 1 ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100 cursor-pointer"} transition-all`}>
                  {category.image ? (
                    <img src={category.image} alt={`${product.name} view ${i}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-8 bg-primary/5 rounded-3xl border border-primary/10">
              <h3 className="font-serif text-2xl font-bold mb-6">Why print with us?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Quality Guarantee</h4>
                    <p className="text-sm text-muted-foreground">If you're not thrilled with the print quality, we'll reprint it for free.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><Zap className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Free File Review</h4>
                    <p className="text-sm text-muted-foreground">Human experts check your files for bleed, resolution, and color.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                Need something custom that's not on this page?{" "}
                <Link href="/quote" className="text-primary font-semibold hover:underline">Request a quote</Link>.
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5">
            <div className="sticky top-24 bg-card rounded-[2rem] border border-border shadow-xl p-8 md:p-10 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight mb-3">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{product.shortDescription}</p>

              <div className="space-y-8 flex-1">
                <div className="space-y-4">
                  <Label className="text-base font-bold">Print Quantity</Label>
                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger className="h-14 text-lg rounded-xl bg-muted/50 border-transparent focus:bg-background"><SelectValue placeholder="Select quantity" /></SelectTrigger>
                    <SelectContent>
                      {["50", "100", "250", "500", "1000", "2500", "5000"].map((q) => (
                        <SelectItem key={q} value={q} className="text-lg">{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {product.sizeOptions && product.sizeOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Size</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.sizeOptions.map((opt) => (
                        <div key={opt} className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${size === opt ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}`} onClick={() => setSize(opt)}>
                          <div className="flex items-center justify-between"><span className="font-semibold">{opt}</span>{size === opt && <Check className="w-5 h-5 text-primary" />}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.materialOptions && product.materialOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Paper / Material</Label>
                    <RadioGroup value={material} onValueChange={setMaterial} className="gap-3">
                      {product.materialOptions.map((opt) => (
                        <div key={opt} className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${material === opt ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setMaterial(opt)}>
                          <RadioGroupItem value={opt} id={`mat-${opt}`} className={material === opt ? "border-primary text-primary" : ""} />
                          <Label htmlFor={`mat-${opt}`} className="cursor-pointer font-medium text-base flex-1">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {product.turnaroundOptions && product.turnaroundOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-bold">Turnaround Time</Label>
                    <RadioGroup value={turnaround} onValueChange={setTurnaround} className="gap-3">
                      {product.turnaroundOptions.map((opt) => (
                        <div key={opt} className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${turnaround === opt ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setTurnaround(opt)}>
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

                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-bold">{isBusinessCard ? "Business Card Artwork" : "Artwork"}</Label>
                    <Link href="/help" className="text-sm text-primary hover:underline flex items-center gap-1">Need design help?</Link>
                  </div>

                  {uploadConfig?.notes && (
                    <p className="text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 px-3 py-2 rounded-lg flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" /> {uploadConfig.notes}
                    </p>
                  )}

                  {isBusinessCard ? (
                    <div className="space-y-5">
                      <BusinessCardPreview frontFile={frontSlot?.file ?? null} backFile={backSlot?.file ?? null} />
                      <UploadSlotUI label="Front Side" slot={frontSlot} onPick={(e) => handlePickFile(e, "front", setFrontSlot)} onClear={() => setFrontSlot(null)} testIdPrefix="front" required={artworkRequired} />
                      {allowsBackUpload && (
                        <UploadSlotUI label="Back Side (optional)" slot={backSlot} onPick={(e) => handlePickFile(e, "back", setBackSlot)} onClear={() => setBackSlot(null)} testIdPrefix="back" />
                      )}
                    </div>
                  ) : (
                    <>
                      <UploadSlotUI label={artworkRequired ? "Upload your design (required)" : "Upload your design (optional)"} slot={frontSlot} onPick={(e) => handlePickFile(e, undefined, setFrontSlot)} onClear={() => setFrontSlot(null)} testIdPrefix="art" required={artworkRequired} />
                      {allowsBackUpload && (
                        <UploadSlotUI label="Back Side (optional)" slot={backSlot} onPick={(e) => handlePickFile(e, "back", setBackSlot)} onClear={() => setBackSlot(null)} testIdPrefix="back" />
                      )}
                    </>
                  )}

                  <p className="text-xs text-muted-foreground flex items-start gap-2 mt-2">
                    <Info className="w-4 h-4 shrink-0" /> Accepted formats: PDF, PNG, JPG, JPEG, SVG, EPS, AI, PSD (max 50 MB). We manually review every file before printing.
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border sticky bottom-0 bg-card z-10 pb-4">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Estimated Total</div>
                    <div className="text-5xl font-black text-foreground">${estimatedPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground mt-1">For {quantity} pieces</div>
                  </div>
                </div>
                <Button size="lg" className="w-full h-16 text-xl rounded-2xl shadow-xl hover-elevate transition-all" onClick={handleAddToCart}>Add to Cart</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-[2rem] border border-border px-8 py-4 shadow-sm">
            <AccordionItem value="item-1" className="border-b border-border">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary">How do I prepare my files for print?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">For the best results, we recommend submitting vector PDF files with all fonts outlined. Ensure your document is in CMYK color mode and includes at least a 0.125" bleed on all sides. Images should be 300 DPI at actual size.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-border">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary">What happens after I place my order?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">Our pre-press team will review your files within 4 business hours. If everything looks perfect, we'll send it straight to production. If we spot any issues (like low resolution or missing bleeds), we'll pause the order and email you immediately to resolve it.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-none">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary">Can you help me design it?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">Absolutely! We have a team of professional graphic designers ready to help. You can place your order without artwork and click "Request Design Help", or contact us directly. Design services are billed separately based on project complexity.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

function UploadSlotUI({ label, slot, onPick, onClear, testIdPrefix, required }: { label: string; slot: UploadedSlot | null; onPick: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void; testIdPrefix: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
        {label}
        {required && <span className="text-xs text-muted-foreground">(required)</span>}
      </div>
      {!slot ? (
        <label className="relative block border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl p-6 text-center hover:bg-primary/10 transition-colors cursor-pointer overflow-hidden">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onPick} accept={ACCEPT_FILE_TYPES} data-testid={`upload-${testIdPrefix}`} />
          <Upload className="w-7 h-7 text-primary mx-auto mb-2" />
          <div className="font-semibold text-sm">Click or drag to upload</div>
          <p className="text-xs text-muted-foreground mt-0.5">PDF · PNG · JPG · SVG · EPS · AI · PSD</p>
        </label>
      ) : (
        <div className="space-y-2">
          <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 flex items-center justify-between gap-3" data-testid={`uploaded-${testIdPrefix}`}>
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${slot.uploading ? "bg-muted text-muted-foreground" : slot.error ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
                {slot.uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : slot.error ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate text-sm" data-testid={`uploaded-${testIdPrefix}-name`}>{slot.file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(slot.file.size)} · {fileExtension(slot.file.name).toUpperCase() || "file"}
                  {slot.width && slot.height ? ` · ${slot.width}×${slot.height}px` : ""}
                  {slot.uploading ? " · uploading…" : slot.error ? ` · ${slot.error}` : " · ready"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={onPick} accept={ACCEPT_FILE_TYPES} />
                <span className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted">Replace</span>
              </label>
              <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:bg-destructive/10 hover:text-destructive" data-testid={`remove-${testIdPrefix}`}>Remove</Button>
            </div>
          </div>
          {slot.warning && (
            <div className="text-xs flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{slot.warning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
