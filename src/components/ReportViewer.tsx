import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Share2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportViewerProps {
  html: string;
  businessName: string;
  onNewReport: () => void;
}

const ReportViewer = ({ html, businessName, onNewReport }: ReportViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-traffic-report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const filename = `${businessName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.html`;
      const file = new Blob([html], { type: "text/html" });

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filename, file, { contentType: "text/html", upsert: false });

      if (uploadError) throw uploadError;

      const shareUrl = `${window.location.origin}/shared/${filename}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err: any) {
      toast.error("Failed to share report: " + (err.message || "Unknown error"));
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="bg-navy text-primary-foreground px-6 py-4 flex items-center justify-between shadow-lg">
        <h2 className="font-display text-lg font-semibold text-white">
          Report: {businessName}
        </h2>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download HTML
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={sharing}
            className="border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            {sharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
            Share
          </Button>
          <Button
            size="sm"
            onClick={onNewReport}
            className="bg-accent hover:bg-blue-glow text-accent-foreground"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Report iframe */}
      <iframe
        ref={iframeRef}
        className="flex-1 w-full border-0"
        title="Traffic Report"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default ReportViewer;
