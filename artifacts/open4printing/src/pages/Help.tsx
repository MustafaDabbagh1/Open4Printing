import { useSeo } from "@/hooks/use-seo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageSquareText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

export default function Help() {
  useSeo({ title: "Help Center", description: "Get support for your printing needs." });
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
      return;
    }
    toast({
      title: "Message sent!",
      description: "Our support team will get back to you within 24 hours.",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6">How can we help?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Whether you need help setting up a file, tracking an order, or choosing the right paper stock, our print experts are here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
        
        {/* Contact Info & Form */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif mb-1">Call Us</h3>
                <p className="text-2xl font-black text-primary mb-2">1-800-OPEN-PRT</p>
                <p className="text-muted-foreground">Mon-Fri: 8am - 8pm EST<br/>Sat: 9am - 5pm EST</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif mb-1">Email Us</h3>
                <p className="text-lg font-bold mb-2">support@open4printing.com</p>
                <p className="text-muted-foreground">We typically reply within 2 hours during business days.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif mb-1">Headquarters</h3>
                <p className="text-lg font-medium mb-1">123 Print Avenue</p>
                <p className="text-muted-foreground">Maker City, NY 10001<br/>(No walk-ins, production facility only)</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquareText className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold font-serif">Send a Message</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 bg-muted/50 border-transparent focus-visible:bg-background" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 bg-muted/50 border-transparent focus-visible:bg-background" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} className="mt-1 min-h-[120px] bg-muted/50 border-transparent focus-visible:bg-background resize-none" />
              </div>
              <Button type="submit" className="w-full h-12 text-base rounded-xl mt-4">Send Message</Button>
            </form>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="lg:col-span-7 lg:pl-12">
          <h2 className="text-3xl font-serif font-bold mb-8">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="faq-1" className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary text-left">
                How do I set up my files for printing?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                <p className="mb-4">For the best results, we require:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Format:</strong> PDF (preferred), AI, PSD, EPS, or high-res JPG/PNG.</li>
                  <li><strong>Color Mode:</strong> CMYK. Files submitted in RGB will be converted automatically, which may cause color shifts.</li>
                  <li><strong>Resolution:</strong> 300 DPI at actual printed size.</li>
                  <li><strong>Bleed:</strong> 0.125" on all sides (e.g., a 2"x3.5" business card needs a 2.25"x3.75" file).</li>
                  <li><strong>Fonts:</strong> Outlined or embedded.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary text-left">
                What is your turnaround time?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                Standard turnaround is 3-5 business days after you approve the digital proof. We also offer expedited 2-day and Next Day production on select items for an additional fee. Shipping time is in addition to production time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary text-left">
                Can I get a physical proof before printing the full run?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                We provide free digital PDF proofs for all orders. If you need a physical hard-copy proof, it is available for an additional fee (starting at $25, depending on the product) and will add 2-3 days to your production time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary text-left">
                Do you offer design services?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                Yes! If you don't have artwork ready, our in-house design team can create custom designs for you. Design services start at $45/hour. You can request a quote by sending us a message with your requirements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-lg font-bold py-6 hover:no-underline hover:text-primary text-left">
                What is your return policy?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                Because all products are custom printed, we do not accept returns. However, we have a 100% Satisfaction Guarantee. If the printing is defective or we made a manufacturing error, we will reprint your order at no cost to you.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
