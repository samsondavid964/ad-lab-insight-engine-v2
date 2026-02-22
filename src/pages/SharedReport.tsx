import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const SharedReport = () => {
  const { id } = useParams<{ id: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      console.log("Attempting to fetch shared report with ID:", id);

      if (!id) {
        console.error("No report ID provided in URL");
        setError("No report ID provided.");
        setLoading(false);
        return;
      }

      try {
        console.log("Downloading report from storage:", id);

        // Match pattern: Use .download(id)
        const { data, error: downloadError } = await supabase.storage
          .from("reports")
          .download(id);

        if (downloadError) {
          console.error("Download error:", downloadError);
          throw downloadError;
        }

        if (data) {
          const text = await data.text();
          console.log("Report content downloaded successfully! Length:", text.length);
          setHtml(text);
        } else {
          throw new Error("No data returned from storage");
        }
      } catch (err: any) {
        console.error("Final error fetching report smoke:", err);
        setError("Report not found. The link might be broken or the file may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    if (html && !loading && iframeRef.current) {
      console.log("Rendering shared report content into iframe via doc.write()...");
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        console.log("Shared report HTML injected successfully");
      } else {
        console.error("FAILED to access iframe contentDocument.");
      }
    }
  }, [html, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <X className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Oops! Something went wrong</h1>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-screen border-0"
      title="Shared Report"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default SharedReport;
