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
    console.log("SharedReport component mounted with ID:", id);
    const fetchReport = async () => {
      if (!id) {
        setError("No report ID provided.");
        setLoading(false);
        return;
      }

      // Ensure we have exactly one .html extension
      const storageKey = id.endsWith(".html") ? id : `${id}.html`;
      console.log("Requesting storage key:", storageKey);

      const { data, error: downloadError } = await supabase.storage
        .from("reports")
        .download(storageKey);

      if (downloadError || !data) {
        console.error("Supabase download error:", downloadError);
        setError(`Storage Error: ${downloadError?.message || "Not found"}`);
        setLoading(false);
        return;
      }

      const text = await data.text();
      console.log("Fetched HTML length:", text.length);
      setHtml(text);
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    if (html && iframeRef.current) {
      console.log("Injecting HTML into iframe...");
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        try {
          doc.open();
          doc.write(html);
          doc.close();
          console.log("Injection complete");
        } catch (e) {
          console.error("Injection failed:", e);
        }
      } else {
        console.error("No contentDocument found on iframe");
      }
    }
  }, [html]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid #3b82f6", borderBottomColor: "transparent", borderRadius: "50%" }} />
          <span>Mounting Report Viewer...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", padding: "20px" }}>
        <div style={{ textAlign: "center", backgroundColor: "rgba(0,0,0,0.3)", padding: "2rem", borderRadius: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Unable to load report</h2>
          <p style={{ color: "#94a3b8" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "white", overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Shared Report"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default SharedReport;
