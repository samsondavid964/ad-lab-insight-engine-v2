import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SharedReport = () => {
  const { id } = useParams<{ id: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setError("No report ID provided.");
        setLoading(false);
        return;
      }

      console.log("Fetching report for ID:", id);
      const { data, error: downloadError } = await supabase.storage
        .from("reports")
        .download(`${id}.html`);

      if (downloadError || !data) {
        console.error("Supabase download error:", downloadError);
        setError("Report not found or could not be loaded.");
        setLoading(false);
        return;
      }

      const text = await data.text();
      setHtml(text);
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    if (html && iframeRef.current) {
      console.log(`Rendering shared report: ${id}, length: ${html.length}`);
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        try {
          doc.open();
          doc.write(html);
          doc.close();
          console.log("Shared report HTML injected successfully");
        } catch (e) {
          console.error("Error writing to iframe:", e);
        }
      } else {
        console.error("FAILED to access iframe contentDocument.");
      }
    }
  }, [html, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="text-slate-400 text-sm">Loading shared report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Error</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Shared Report"
      />
    </div>
  );
};

export default SharedReport;
