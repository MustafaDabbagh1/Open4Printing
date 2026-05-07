import { useSeo } from "@/hooks/use-seo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Upload() {
  useSeo({ title: "Upload Artwork", description: "Send your files to our prepress team for review." });
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast({
        title: "No files attached",
        description: "Please upload at least one file.",
        variant: "destructive"
      });
      return;
    }
    if (!email) {
      toast({
        title: "Email required",
        description: "We need your email to send the review results.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Files submitted!",
      description: "Our prepress team will review your artwork and email you shortly.",
    });
    setFiles([]);
    setNotes("");
    setEmail("");
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight mb-6">Upload Artwork</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Skip the setup. Send us your print-ready files and our expert prepress team will review them for free before you place an order.
        </p>
      </div>

      <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-6 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Dropzone */}
          <div className="space-y-4">
            <Label className="text-xl font-bold">1. Attach Files</Label>
            <div 
              className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-200 overflow-hidden ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border bg-muted/50 hover:bg-muted'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileInput}
              />
              <div className="relative z-0 pointer-events-none flex flex-col items-center">
                <div className="w-24 h-24 bg-background rounded-full shadow-sm flex items-center justify-center text-primary mb-6">
                  <UploadCloud className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Drag & drop files here</h3>
                <p className="text-muted-foreground text-lg mb-6">or click to browse your computer</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['PDF', 'PSD', 'AI', 'INDD', 'EPS', 'PNG', 'JPG'].map(ext => (
                    <span key={ext} className="px-3 py-1 bg-background rounded-md text-xs font-bold text-muted-foreground border border-border shadow-sm">{ext}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Attached Files ({files.length})</h4>
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-background border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold">{file.name}</div>
                        <div className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setFiles(files.filter((_, index) => index !== i))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border">
            <div className="space-y-4">
              <Label className="text-xl font-bold">2. Your Info</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-muted-foreground mb-2 block">Email Address *</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="hello@yourcompany.com" 
                    className="h-14 text-lg rounded-xl bg-muted/50 border-transparent focus-visible:bg-background"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xl font-bold">3. Design Notes</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes" className="text-muted-foreground mb-2 block">Instructions or questions</Label>
                  <Textarea 
                    id="notes"
                    placeholder="e.g. Please check if the blue background bleeds correctly, this is for a 24x36 yard sign." 
                    className="min-h-[120px] text-lg rounded-xl bg-muted/50 border-transparent focus-visible:bg-background resize-none"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col items-center">
            <Button type="submit" size="lg" className="w-full md:w-auto h-16 px-12 text-xl rounded-full shadow-xl hover-elevate">
              Send for Free Review
            </Button>
            <p className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> We typically review files within 2-4 business hours.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
