import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import adLabLogo from "@/assets/ad-lab-logo.png";
import ReportForm from "@/components/ReportForm";
import LoadingState from "@/components/LoadingState";
import ReportViewer from "@/components/ReportViewer";
import ReportHistory from "@/components/ReportHistory";
import { initiateReport, pollForCompletion, generateJobId } from "@/lib/api";
import {
  getReportHistory,
  saveReport,
  ReportHistoryEntry } from
"@/lib/report-history";

type AppState = "form" | "loading" | "report";

const Index = () => {
  const [state, setState] = useState<AppState>("form");
  const [clientName, setClientName] = useState("");
  const [reportHtml, setReportHtml] = useState("");
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentEntryRef = useRef<ReportHistoryEntry | null>(null);

  useEffect(() => {
    setHistory(getReportHistory());
  }, []);

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (delayRef.current) clearTimeout(delayRef.current);
    pollRef.current = null;
    timerRef.current = null;
    delayRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const handleSubmit = async (data: {
    clientName: string;
    googleAdsId: string;
    startDate: string;
    endDate: string;
  }) => {
    setClientName(data.clientName);
    setState("loading");
    setElapsed(0);

    try {
      const job_id = generateJobId();
      await initiateReport({
        job_id,
        client_name: data.clientName,
        google_ads_id: data.googleAdsId,
        date_range: { start: data.startDate, end: data.endDate }
      });
      const entry: ReportHistoryEntry = {
        id: job_id,
        clientName: data.clientName,
        googleAdsId: data.googleAdsId,
        dateRange: { start: data.startDate, end: data.endDate },
        jobId: job_id,
        createdAt: new Date().toISOString()
      };
      saveReport(entry);
      currentEntryRef.current = entry;
      setHistory(getReportHistory());

      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);

      let attempts = 0;
      const maxAttempts = 16;

      delayRef.current = setTimeout(() => {
        pollRef.current = setInterval(async () => {
          attempts++;
          try {
            const result = await pollForCompletion(job_id);

            if (result.status === "complete" && result.html) {
              cleanup();
              setReportHtml(result.html);

              if (currentEntryRef.current) {
                currentEntryRef.current.html = result.html;
                saveReport(currentEntryRef.current);
                setHistory(getReportHistory());
              }

              setState("report");
              toast.success("Report generated successfully!");
            } else if (result.status === "error") {
              cleanup();
              setState("form");
              toast.error(result.error || "Report generation failed. Please try again.");
            } else if (attempts >= maxAttempts) {
              cleanup();
              setState("form");
              toast.error("Report generation timed out. Please try again.");
            }
          } catch {
            if (attempts >= maxAttempts) {
              cleanup();
              setState("form");
              toast.error("Report generation timed out. Please try again.");
            }
          }
        }, 20000);
      }, 120000);
    } catch {
      setState("form");
      toast.error("Failed to initiate report. Please check your connection and try again.");
    }
  };

  const handleNewReport = () => {
    cleanup();
    setReportHtml("");
    setClientName("");
    setState("form");
  };

  const handleViewHistory = (entry: ReportHistoryEntry) => {
    if (entry.html) {
      setClientName(entry.clientName);
      setReportHtml(entry.html);
      setState("report");
    }
  };

  if (state === "loading") {
    return <LoadingState businessName={clientName} elapsedSeconds={elapsed} />;
  }

  if (state === "report") {
    return (
      <ReportViewer
        html={reportHtml}
        businessName={clientName}
        onNewReport={handleNewReport} />);


  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with solid navy gradient */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-20 text-center">
          <img
            src={adLabLogo}
            alt="Ad-Lab"
            className="h-20 mx-auto mb-8 rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10" />

          <h1 className="text-5xl md:text-5xl text-white mb-4 font-serif text-center font-extrabold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Traffic Intelligence
          </h1>
          <p className="text-blue-200/80 text-lg max-w-lg mx-auto">
            Generate in-depth website traffic analysis reports for any client
          </p>
        </div>
      </header>

      {/* Form card overlapping the header */}
      <main className="max-w-xl mx-auto px-6 -mt-10 pb-16 relative z-10">
        <ReportForm onSubmit={handleSubmit} isLoading={state !== "form"} />
        <ReportHistory
          history={history}
          onView={handleViewHistory}
          onRefresh={() => setHistory(getReportHistory())} />

      </main>
    </div>);

};

export default Index;