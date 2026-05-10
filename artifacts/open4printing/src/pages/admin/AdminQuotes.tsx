import { Link } from "wouter";
import { useListAdminQuotes } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";

export default function AdminQuotes() {
  return (
    <AdminLayout>
      <Inner />
    </AdminLayout>
  );
}

function Inner() {
  const { data, isLoading } = useListAdminQuotes();
  if (isLoading || !data) return <div>Loading…</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-black">Quote requests</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 && (<tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No quotes yet.</td></tr>)}
            {data.map((q) => (
              <tr key={q.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{new Date(q.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{q.name}</td>
                <td className="px-4 py-3">{q.email}</td>
                <td className="px-4 py-3">{q.productCategory}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">{q.status}</span></td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/quotes/${q.id}`} className="text-primary text-sm hover:underline">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
