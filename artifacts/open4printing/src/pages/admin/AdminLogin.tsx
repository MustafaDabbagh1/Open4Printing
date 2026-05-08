import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin, useAdminMe, getAdminMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useAdminLogin();
  const me = useAdminMe({ query: { retry: false, queryKey: getAdminMeQueryKey() } });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (me.data) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ data: { email, password } });
      await me.refetch();
      setLocation("/admin");
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Check your credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-full bg-primary/10 text-primary items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif font-black">Admin login</h1>
          <p className="text-muted-foreground mt-2">Manage orders and products.</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
