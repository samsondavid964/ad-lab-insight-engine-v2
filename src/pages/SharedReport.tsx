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
        console.log("Fetching report for ID:", id);

        // Strategy: Try the exact ID first, then try alternatives
        const tryFetch = async (fileId: string) => {
          const { data: { publicUrl } } = supabase.storage.from("reports").getPublicUrl(fileId);
          console.log(`Checking URL: ${publicUrl}`);
          const response = await fetch(publicUrl);
          const text = response.ok ? await response.text() : null;
          return { response, text };
        };

        // 1. Try exact match
        let result = await tryFetch(id);

        // 2. If not found and had no extension, try adding .html
        if (!result.response.ok && !id.endsWith(".html")) {
          console.log("Not found as-is, trying with .html extension...");
          result = await tryFetch(`${id}.html`);
        }

        // 3. If not found and HAD .html, try WITHOUT it
        if (!result.response.ok && id.endsWith(".html")) {
          console.log("Not found with extension, trying without .html...");
          result = await tryFetch(id.replace(".html", ""));
        }

        if (result.response.ok && result.text) {
          console.log("Report content loaded successfully! Length:", result.text.length);
          setHtml(result.text);
        } else {
          console.error("Failed to find report after trying all variations.");
          throw new Error(`Report not found (Status ${result.response.status})`);
        }
      } catch (err: any) {
        console.error("Final error fetching report:", err);
        setError("Report not found. The link might be broken or the file may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    if (html && !loading && iframeRef.current) {
      console.log("Rendering shared report content into iframe...");
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        console.log("Shared report HTML injected successfully");
      } else {
        console.error("FAILED to access iframe contentDocument. Check sandbox permissions. 'allow-same-origin' is required for doc.write().");
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
