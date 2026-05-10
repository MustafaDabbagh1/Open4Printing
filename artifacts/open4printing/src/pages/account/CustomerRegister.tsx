import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCustomerRegister } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useCustomerRegister();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    try {
      await register.mutateAsync({ data: { email, password, firstName, lastName, phone: phone || null } });
      setLocation("/account/orders");
    } catch (err) {
      toast({ title: "Sign up failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-serif font-black mb-2">Create an account</h1>
      <p className="text-muted-foreground mb-8">Save addresses and track all your orders in one place.</p>
      <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">First name</Label><Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Last name</Label><Input required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Phone (optional)</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Password (min 8 chars)</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={register.isPending}>{register.isPending ? "Creating…" : "Create account"}</Button>
        <p className="text-sm text-muted-foreground text-center">Already have an account? <Link href="/account/login" className="text-primary hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
}
