import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Share2, Loader2, Pencil, Save, X, Paintbrush, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEditMode } from "./report-editor/useEditMode";
import { useChartInstances } from "./report-editor/useChartInstances";
import { useSectionReorder } from "./report-editor/SectionReorder";
import EditToolbar from "./report-editor/EditToolbar";
import ChartEditor from "./report-editor/ChartEditor";
import StyleEditor from "./report-editor/StyleEditor";

interface ReportViewerProps {
  html: string;
  businessName: string;
  onNewReport: () => void;
}

const ReportViewer = ({ html, businessName, onNewReport }: ReportViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sharing, setSharing] = useState(false);
  const [styleEditorOpen, setStyleEditorOpen] = useState(false);

  const { editMode, editedHtml, toggleEditMode, extractHtml, setEditedHtml } = useEditMode(iframeRef);
  const { selectedChart, setSelectedChart, updateChart, setupChartClickHandlers } = useChartInstances(iframeRef);
  const { addDragHandles, removeDragHandles } = useSectionReorder(iframeRef);

  // Current HTML to use for download/share (edited version if available)
  const currentHtml = editedHtml || html;

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
    // Reset edited state when new html comes in
    setEditedHtml(null);
  }, [html]);

  // Setup chart click handlers when entering edit mode
  useEffect(() => {
    if (editMode) {
      // Small delay to ensure iframe content is ready
      const timer = setTimeout(() => {
        setupChartClickHandlers((chart) => {
          setSelectedChart(chart);
        });
        addDragHandles();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      removeDragHandles();
      setSelectedChart(null);
      setStyleEditorOpen(false);
    }
  }, [editMode]);

  const handleSave = () => {
    const saved = extractHtml();
    if (saved) {
      toggleEditMode();
      toast.success("Changes saved!");
    }
  };

  const handleCancelEdit = () => {
    // Restore original HTML
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(editedHtml || html);
        doc.close();
      }
    }
    toggleEditMode();
  };

  const handleDownload = () => {
    const blob = new Blob([currentHtml], { type: "text/html" });
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
      const file = new Blob([currentHtml], { type: "text/html" });

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
      <div className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <h2 className="font-display text-lg font-semibold text-white">
          Report: {businessName}
        </h2>
        <div className="flex gap-3">
          {editMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStyleEditorOpen(true)}
                className="border border-white/30 text-white hover:bg-white/10"
              >
                <Paintbrush className="w-4 h-4 mr-2" />
                Styles
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="border border-white/30 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-accent hover:bg-blue-glow text-accent-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
                className="border border-white/30 text-white hover:bg-white/10"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="border border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download HTML
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={sharing}
                className="border border-white/30 text-white hover:bg-white/10"
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
            </>
          )}
        </div>
      </div>

      {/* Edit mode banner */}
      {editMode && (
        <div className="bg-accent/10 border-b border-accent/30 px-6 py-2 flex items-center gap-4 text-sm text-accent">
          <Pencil className="h-4 w-4" />
          <span className="font-medium">Edit Mode:</span>
          <span className="text-muted-foreground">Click text to edit • Click charts to modify data • Drag sections to reorder</span>
        </div>
      )}

      {/* Floating text toolbar */}
      <EditToolbar iframeRef={iframeRef} visible={editMode} />

      {/* Chart editor sidebar */}
      <ChartEditor
        chart={selectedChart}
        onClose={() => setSelectedChart(null)}
        onUpdate={updateChart}
      />

      {/* Style editor sidebar */}
      <StyleEditor
        iframeRef={iframeRef}
        open={styleEditorOpen}
        onClose={() => setStyleEditorOpen(false)}
      />

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
