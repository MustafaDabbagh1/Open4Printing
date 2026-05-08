import { useState, useEffect } from "react";
import { useListAdminProducts, useUpdateAdminProduct, getListAdminProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
  startingPrice: string;
  enabled: boolean;
}

function Inner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListAdminProducts();
  const update = useUpdateAdminProduct();
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});

  useEffect(() => {
    if (!data) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const p of data) {
        if (!next[p.id]) {
          next[p.id] = { name: p.name, shortDescription: p.shortDescription, startingPrice: p.startingPrice.toString(), enabled: p.enabled };
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
        data: { name: d.name, shortDescription: d.shortDescription, startingPrice: Number(d.startingPrice), enabled: d.enabled },
      });
      await queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
      toast({ title: "Product saved" });
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-black">Products</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 w-32">Starting price</th>
              <th className="px-4 py-3 w-24">Enabled</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((p) => {
              const d = drafts[p.id] ?? { name: p.name, shortDescription: p.shortDescription, startingPrice: p.startingPrice.toString(), enabled: p.enabled };
              const setD = (patch: Partial<Draft>) => setDrafts((prev) => ({ ...prev, [p.id]: { ...d, ...patch } }));
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 align-top">
                    <Input value={d.name} onChange={(e) => setD({ name: e.target.value })} />
                    <div className="text-xs font-mono text-muted-foreground mt-1">{p.slug}</div>
                    <Input className="mt-2" value={d.shortDescription} onChange={(e) => setD({ shortDescription: e.target.value })} />
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{p.categorySlug}</td>
                  <td className="px-4 py-3 align-top">
                    <Input type="number" step="0.01" value={d.startingPrice} onChange={(e) => setD({ startingPrice: e.target.value })} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <input type="checkbox" checked={d.enabled} onChange={(e) => setD({ enabled: e.target.checked })} className="w-4 h-4" />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Button size="sm" onClick={() => save(p.id)} disabled={update.isPending}>Save</Button>
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
