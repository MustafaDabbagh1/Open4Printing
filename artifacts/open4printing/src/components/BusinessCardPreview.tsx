import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface Props {
  frontFile: File | null;
  backFile: File | null;
}

type Tab = "front" | "back";

export default function BusinessCardPreview({ frontFile, backFile }: Props) {
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("front");

  useEffect(() => {
    if (!frontFile || !isImage(frontFile)) { setFrontUrl(null); return; }
    const url = URL.createObjectURL(frontFile);
    setFrontUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [frontFile]);

  useEffect(() => {
    if (!backFile || !isImage(backFile)) { setBackUrl(null); return; }
    const url = URL.createObjectURL(backFile);
    setBackUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [backFile]);

  const showBack = !!backFile;

  return (
    <div className="space-y-3" data-testid="business-card-preview">
      {showBack && (
        <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("front")}
            className={`px-3 py-1.5 rounded-md transition-colors ${tab === "front" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            data-testid="bc-tab-front"
          >
            Front Preview
          </button>
          <button
            type="button"
            onClick={() => setTab("back")}
            className={`px-3 py-1.5 rounded-md transition-colors ${tab === "back" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            data-testid="bc-tab-back"
          >
            Back Preview
          </button>
        </div>
      )}

      <div
        className="relative w-full max-w-sm bg-white rounded-lg border border-border shadow-md overflow-hidden mx-auto"
        style={{ aspectRatio: "3.5 / 2" }}
      >
        {(() => {
          const active = showBack && tab === "back" ? backUrl : frontUrl;
          const activeFile = showBack && tab === "back" ? backFile : frontFile;
          if (active) {
            return (
              <img
                src={active}
                alt={`${tab} preview`}
                className="absolute inset-0 w-full h-full object-contain bg-white"
                data-testid={`bc-preview-image-${tab}`}
              />
            );
          }
          if (activeFile) {
            return (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-muted-foreground bg-muted/20">
                <ImageIcon className="w-8 h-8 mb-2" />
                <div className="text-xs font-medium">{activeFile.name}</div>
                <div className="text-[11px]">Preview not available for this file type</div>
              </div>
            );
          }
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-muted-foreground bg-muted/20">
              <ImageIcon className="w-8 h-8 mb-2" />
              <div className="text-xs font-medium">Upload a {tab} design to see your business card preview</div>
            </div>
          );
        })()}
      </div>

      <p className="text-[11px] text-muted-foreground text-center max-w-sm mx-auto">
        Preview is for reference only. Final print quality depends on uploaded file resolution.
      </p>
    </div>
  );
}

function isImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "svg";
}
