import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle } from "lucide-react";

interface ReportViewerProps {
  html: string;
  businessName: string;
  onNewReport: () => void;
}

const ReportViewer = ({ html, businessName, onNewReport }: ReportViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="bg-navy text-primary-foreground px-6 py-4 flex items-center justify-between shadow-lg">
        <h2 className="font-display text-lg font-semibold">
          Report: {businessName}
        </h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download HTML
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
