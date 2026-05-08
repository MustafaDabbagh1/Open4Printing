import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAdminMe, useAdminLogout, getAdminMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingBag, Package, LogOut } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const me = useAdminMe({ query: { retry: false, queryKey: getAdminMeQueryKey() } });
  const logout = useAdminLogout();

  if (me.isLoading) {
    return <div className="p-12 text-center">Loading…</div>;
  }
  if (me.isError || !me.data) {
    setLocation("/admin/login");
    return null;
  }

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/admin/login");
  };

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: typeof LayoutDashboard; children: ReactNode }) => {
    const active = location === href || (href !== "/admin" && location.startsWith(href));
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
        <Icon className="w-4 h-4" /> {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border p-4 sticky top-24">
              <div className="px-4 py-3 mb-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</div>
                <div className="font-bold truncate">{me.data.email}</div>
              </div>
              <nav className="space-y-1">
                <NavLink href="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink href="/admin/orders" icon={ShoppingBag}>Orders</NavLink>
                <NavLink href="/admin/products" icon={Package}>Products</NavLink>
              </nav>
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </Button>
              </div>
            </div>
          </aside>
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
