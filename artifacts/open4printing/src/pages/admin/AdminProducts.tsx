import { useState, useEffect } from "react";
import {
  useListAdminProducts,
  useUpdateAdminProduct,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  getListAdminProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, X } from "lucide-react";
import { categories } from "@/data/products";

export default function AdminProducts() {
  return (
    <AdminLayout>
      <Inner />
    </AdminLayout>
  );
}

interface Draft {
  name: string;
  shortDescription: string;
  description: string;
  startingPrice: string;
  enabled: boolean;
  categorySlug: string;
  artworkRequired: boolean;
  allowsBackUpload: boolean;
}

function Inner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListAdminProducts();
  const update = useUpdateAdminProduct();
  const remove = useDeleteAdminProduct();
  const create = useCreateAdminProduct();
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!data) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const p of data) {
        if (!next[p.id]) {
          next[p.id] = {
            name: p.name,
            shortDescription: p.shortDescription,
            description: p.description ?? "",
            startingPrice: p.startingPrice.toString(),
            enabled: p.enabled,
            categorySlug: p.categorySlug,
            artworkRequired: p.uploadConfig?.artworkRequired ?? true,
            allowsBackUpload: p.uploadConfig?.allowsBackUpload ?? false,
          };
        }
      }
      return next;
    });
  }, [data]);

  if (isLoading || !data) return <div>Loading…</div>;

  const save = async (id: number) => {
    const d = drafts[id];
    if (!d) return;
    try {
      await update.mutateAsync({
        id,
        data: {
          name: d.name,
          shortDescription: d.shortDescription,
          description: d.description,
          startingPrice: Number(d.startingPrice),
          enabled: d.enabled,
          categorySlug: d.categorySlug,
          uploadConfig: {
            artworkRequired: d.artworkRequired,
            allowsBackUpload: d.allowsBackUpload,
            preferredFormats: ["pdf", "png", "jpg"],
            notes: "",
          },
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
      toast({ title: "Product saved" });
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const del = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await remove.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
      toast({ title: "Product deleted" });
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-serif font-black">Products</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Add product</Button>
      </div>

      {showCreate && (
        <CreateProductCard
          onCancel={() => setShowCreate(false)}
          onCreated={async () => {
            await queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
            setShowCreate(false);
            toast({ title: "Product created" });
          }}
          create={create}
        />
      )}

      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Name & description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 w-32">Starting price</th>
              <th className="px-4 py-3 w-44">Upload rules</th>
              <th className="px-4 py-3 w-20">Enabled</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((p) => {
              const d = drafts[p.id];
              if (!d) return null;
              const setD = (patch: Partial<Draft>) => setDrafts((prev) => ({ ...prev, [p.id]: { ...d, ...patch } }));
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 align-top space-y-2 min-w-[260px]">
                    <Input value={d.name} onChange={(e) => setD({ name: e.target.value })} />
                    <div className="text-xs font-mono text-muted-foreground">{p.slug}</div>
                    <Input value={d.shortDescription} onChange={(e) => setD({ shortDescription: e.target.value })} placeholder="Short description" />
                    <Textarea rows={2} value={d.description} onChange={(e) => setD({ description: e.target.value })} placeholder="Long description (optional)" />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={d.categorySlug} onChange={(e) => setD({ categorySlug: e.target.value })}>
                      {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                      {!categories.find((c) => c.slug === d.categorySlug) && <option value={d.categorySlug}>{d.categorySlug}</option>}
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input type="number" step="0.01" value={d.startingPrice} onChange={(e) => setD({ startingPrice: e.target.value })} />
                  </td>
                  <td className="px-4 py-3 align-top space-y-1">
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={d.artworkRequired} onChange={(e) => setD({ artworkRequired: e.target.checked })} /> Artwork required</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={d.allowsBackUpload} onChange={(e) => setD({ allowsBackUpload: e.target.checked })} /> Allow back upload</label>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <input type="checkbox" checked={d.enabled} onChange={(e) => setD({ enabled: e.target.checked })} className="w-4 h-4" />
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => save(p.id)} disabled={update.isPending}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => del(p.id, p.name)} disabled={remove.isPending}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateProductCard({ create, onCancel, onCreated }: { create: ReturnType<typeof useCreateAdminProduct>; onCancel: () => void; onCreated: () => void | Promise<void> }) {
  const { toast } = useToast();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "business-cards");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("19.99");
  const [artworkRequired, setArtworkRequired] = useState(true);
  const [allowsBackUpload, setAllowsBackUpload] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !name.trim()) {
      toast({ title: "Missing fields", description: "Slug and name are required.", variant: "destructive" });
      return;
    }
    try {
      await create.mutateAsync({
        data: {
          slug: slug.trim(),
          name: name.trim(),
          categorySlug,
          shortDescription,
          description,
          startingPrice: Number(startingPrice),
          enabled: true,
          uploadConfig: { artworkRequired, allowsBackUpload, preferredFormats: ["pdf", "png", "jpg"], notes: "" },
        },
      });
      await onCreated();
    } catch (err) {
      toast({ title: "Create failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">New product</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Slug (url-id)</label><Input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="custom-product" /></div>
        <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Name</label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Category</label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
            {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
          </select>
        </div>
        <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Starting price ($)</label><Input type="number" step="0.01" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Short description</label><Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} /></div>
      <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Long description (optional)</label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={artworkRequired} onChange={(e) => setArtworkRequired(e.target.checked)} /> Artwork required</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowsBackUpload} onChange={(e) => setAllowsBackUpload(e.target.checked)} /> Allow back upload</label>
      </div>
      <div className="flex gap-2"><Button type="submit" disabled={create.isPending}>Create</Button><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
