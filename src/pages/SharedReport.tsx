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

      const { data, error: downloadError } = await supabase.storage
        .from("reports")
        .download(id);

      if (downloadError || !data) {
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
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive text-lg">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-screen border-0"
      title="Shared Report"
      sandbox="allow-same-origin allow-scripts"
    />
  );
};

export default SharedReport;
