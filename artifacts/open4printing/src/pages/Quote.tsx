import { useState } from "react";
import { useLocation } from "wouter";
import { useSeo } from "@/hooks/use-seo";
import { useCreateQuoteRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/data/products";
import { uploadFile, ACCEPT_FILE_TYPES, isAllowedFile, formatFileSize } from "@/lib/api";
import { Upload, Check, X, RefreshCw, MessageSquare } from "lucide-react";

interface QuoteFile {
  id: number;
  name: string;
  size: number;
  type: string;
}

export default function Quote() {
  useSeo({ title: "Request a Quote", description: "Tell us what you need and we'll send a custom quote." });
  const create = useCreateQuoteRequest();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productCategory, setProductCategory] = useState(categories[0]?.slug ?? "business-cards");
  const [description, setDescription] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<QuoteFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: number } | null>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (!isAllowedFile(picked.name)) {
      toast({ title: "Unsupported file", description: "Allowed: PDF, PNG, JPG, JPEG, SVG, EPS, AI, PSD.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFile(picked);
      setFiles((prev) => [...prev, { id: result.id, name: picked.name, size: result.fileSize, type: result.fileType }]);
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !description.trim()) {
      toast({ title: "Please complete the form", description: "Name, valid email, and a description are required.", variant: "destructive" });
      return;
    }
    try {
      const result = await create.mutateAsync({
        data: {
          name,
          email,
          phone: phone || null,
          productCategory,
          productSlug: null,
          description,
          requestedQuantity: requestedQuantity ? Number(requestedQuantity) : null,
          notes: notes ?? "",
          uploadedFileIds: files.map((f) => f.id),
        },
      });
      setSubmitted({ id: result.id });
      toast({ title: "Quote request received", description: "We'll be in touch within 1 business day." });
    } catch (err) {
      toast({ title: "Submission failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto mb-6 flex items-center justify-center">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif font-black mb-3">Thanks — request #{submitted.id} received</h1>
        <p className="text-muted-foreground mb-6">A team member will email you a tailored quote within 1 business day.</p>
        <Button onClick={() => setLocation("/")}>Back to home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-serif font-black">Request a Quote</h1>
      </div>
      <p className="text-muted-foreground mb-8">Need something custom or large-volume? Tell us what you have in mind and we'll send a tailored quote.</p>
      <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Your name"><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone (optional)"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Product category">
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
              {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
            </select>
          </Field>
          <Field label="Estimated quantity (optional)"><Input type="number" inputMode="numeric" min={1} value={requestedQuantity} onChange={(e) => setRequestedQuantity(e.target.value)} /></Field>
        </div>

        <Field label="Project description">
          <Textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us what you need: product type, sizes, materials, deadlines, etc." />
        </Field>

        <Field label="Anything else? (optional)">
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Attach files (optional)</Label>
          <div className="mt-2 space-y-2">
            <label className="block border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-5 text-center cursor-pointer hover:bg-primary/10">
              <input type="file" className="hidden" accept={ACCEPT_FILE_TYPES} onChange={handlePick} />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> Uploading…</div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm"><Upload className="w-4 h-4" /> Add a file</div>
              )}
            </label>
            {files.map((f, idx) => (
              <div key={f.id} className="flex items-center justify-between gap-3 border border-border rounded-lg px-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(f.size)} · {f.type}</div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full h-12 rounded-xl" disabled={create.isPending}>{create.isPending ? "Submitting…" : "Send quote request"}</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
