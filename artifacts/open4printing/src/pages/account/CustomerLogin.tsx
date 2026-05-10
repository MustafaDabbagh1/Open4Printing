import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCustomerLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useCustomerLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ data: { email, password } });
      setLocation("/account/orders");
    } catch (err) {
      toast({ title: "Sign in failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-serif font-black mb-2">Sign in</h1>
      <p className="text-muted-foreground mb-8">Access your past orders and saved addresses.</p>
      <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Password</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Sign in"}</Button>
        <p className="text-sm text-muted-foreground text-center">No account yet? <Link href="/account/register" className="text-primary hover:underline">Create one</Link></p>
      </form>
    </div>
  );
}
