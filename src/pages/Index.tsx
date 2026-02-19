import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import adLabLogo from "@/assets/ad-lab-logo.png";
import ReportForm from "@/components/ReportForm";
import LoadingState from "@/components/LoadingState";
import ReportViewer from "@/components/ReportViewer";
import ReportHistory from "@/components/ReportHistory";
import { initiateReport, pollForCompletion } from "@/lib/api";
import {
  getReportHistory,
  saveReport,
  ReportHistoryEntry,
} from "@/lib/report-history";

type AppState = "form" | "loading" | "report";

const Index = () => {
  const [state, setState] = useState<AppState>("form");
  const [businessName, setBusinessName] = useState("");
  const [reportHtml, setReportHtml] = useState("");
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentEntryRef = useRef<ReportHistoryEntry | null>(null);

  useEffect(() => {
    setHistory(getReportHistory());
  }, []);

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const handleSubmit = async (data: {
    businessName: string;
    websiteUrl: string;
    startDate: string;
    endDate: string;
  }) => {
    setBusinessName(data.businessName);
    setState("loading");
    setElapsed(0);

    try {
      const { job_id } = await initiateReport({
        business_name: data.businessName,
        website_url: data.websiteUrl,
        date_range: { start: data.startDate, end: data.endDate },
      });

      const entry: ReportHistoryEntry = {
        id: job_id,
        businessName: data.businessName,
        websiteUrl: data.websiteUrl,
        dateRange: { start: data.startDate, end: data.endDate },
        jobId: job_id,
        createdAt: new Date().toISOString(),
      };
      saveReport(entry);
      currentEntryRef.current = entry;
      setHistory(getReportHistory());

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);

      // Start polling
      let attempts = 0;
      const maxAttempts = 36; // 3 minutes at 5s intervals

      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const result = await pollForCompletion(job_id);

          if (result.status === "complete" && result.html) {
            cleanup();
            setReportHtml(result.html);

            // Save HTML to history
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
      }, 5000);
    } catch {
      setState("form");
      toast.error("Failed to initiate report. Please check your connection and try again.");
    }
  };

  const handleNewReport = () => {
    cleanup();
    setReportHtml("");
    setBusinessName("");
    setState("form");
  };

  const handleViewHistory = (entry: ReportHistoryEntry) => {
    if (entry.html) {
      setBusinessName(entry.businessName);
      setReportHtml(entry.html);
      setState("report");
    }
  };

  if (state === "loading") {
    return <LoadingState businessName={businessName} elapsedSeconds={elapsed} />;
  }

  if (state === "report") {
    return (
      <ReportViewer
        html={reportHtml}
        businessName={businessName}
        onNewReport={handleNewReport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <img
            src={adLabLogo}
            alt="Ad-Lab"
            className="h-16 mx-auto mb-6 rounded-xl"
          />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            Traffic Intelligence
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-lg mx-auto">
            Generate in-depth website traffic analysis reports for any client
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-xl mx-auto px-6 -mt-8 pb-16 relative z-10">
        <ReportForm onSubmit={handleSubmit} isLoading={state !== "form"} />
        <ReportHistory
          history={history}
          onView={handleViewHistory}
          onRefresh={() => setHistory(getReportHistory())}
        />
      </main>
    </div>
  );
};

export default Index;
