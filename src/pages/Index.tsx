import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import adLabLogo from "@/assets/ad-lab-logo.png";
import ReportForm from "@/components/ReportForm";
import LoadingState from "@/components/LoadingState";
import ReportViewer from "@/components/ReportViewer";
import ReportHistory from "@/components/ReportHistory";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initiateReport, pollForCompletion, generateJobId } from "@/lib/api";
import {
  getReportHistory,
  createReport,
  updateReport,
  ReportHistoryEntry
} from "@/lib/report-history";

type AppState = "form" | "loading" | "report";

const Index = () => {
  const { signOut, user } = useAuth();
  const [state, setState] = useState<AppState>("form");
  const [clientName, setClientName] = useState("");
  const [reportHtml, setReportHtml] = useState("");
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentJobIdRef = useRef<string | null>(null);

  const refreshHistory = useCallback(async () => {
    const data = await getReportHistory();
    setHistory(data);
  }, []);

  useEffect(() => {
    refreshHistory().finally(() => setHistoryLoading(false));
  }, [refreshHistory]);

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
    if (!user) return;

    setClientName(data.clientName);
    setState("loading");
    setElapsed(0);

    try {
      const job_id = generateJobId();
      currentJobIdRef.current = job_id;

      // 1. Persist the job to Supabase immediately
      await createReport({
        jobId: job_id,
        userId: user.id,
        clientName: data.clientName,
        googleAdsId: data.googleAdsId,
        dateRange: { start: data.startDate, end: data.endDate },
      });

      // 2. Kick off n8n workflow
      await initiateReport({
        job_id,
        client_name: data.clientName,
        google_ads_id: data.googleAdsId,
        date_range: { start: data.startDate, end: data.endDate }
      });

      // Refresh history to show our new pending job
      await refreshHistory();

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
              // Update Supabase with the final HTML
              await updateReport(job_id, { status: "complete", html: result.html });
              setReportHtml(result.html);
              await refreshHistory();
              setState("report");
              toast.success("Report generated successfully!");
            } else if (result.status === "error") {
              cleanup();
              await updateReport(job_id, { status: "error" });
              await refreshHistory();
              setState("form");
              toast.error(result.error || "Report generation failed. Please try again.");
            } else if (attempts >= maxAttempts) {
              cleanup();
              await updateReport(job_id, { status: "error" });
              await refreshHistory();
              setState("form");
              toast.error("Report generation timed out. Please try again.");
            }
          } catch {
            if (attempts >= maxAttempts) {
              cleanup();
              await updateReport(job_id, { status: "error" });
              await refreshHistory();
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
        onNewReport={handleNewReport} />
    );
  }

  const firstName = user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with refined dark gradient */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #080c18 0%, #0f172a 40%, #121d33 60%, #0f172a 100%)" }}>
        {/* Animated mesh overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/[0.06] blur-[100px] animate-[float_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-500/[0.04] blur-[80px] animate-[float_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-cyan-500/[0.03] blur-[60px] animate-[float_18s_ease-in-out_infinite_3s]" />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="absolute top-5 right-5 z-20">
          <Button variant="ghost" onClick={signOut} className="text-slate-400 hover:text-white hover:bg-white/5 group transition-all duration-300 rounded-xl">
            <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </Button>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-24 text-center">
          <img
            src={adLabLogo}
            alt="Ad-Lab"
            className="h-20 mx-auto mb-8 rounded-2xl shadow-2xl shadow-blue-500/20 ring-1 ring-white/10" />

          <h1 className="text-4xl md:text-5xl text-white mb-3 font-serif font-extrabold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Traffic Intelligence
          </h1>
          <p className="text-blue-200/50 text-base max-w-lg mx-auto mb-6">
            Generate in-depth traffic analysis reports for any client
          </p>

          {/* Greeting pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Welcome back, <span className="text-blue-300 font-medium">{firstName}</span>
          </div>
        </div>
      </header>

      {/* Form card overlapping the header */}
      <main className="max-w-xl mx-auto px-6 -mt-12 pb-16 relative z-10">
        <div className="animate-slide-up">
          <ReportForm onSubmit={handleSubmit} isLoading={state !== "form"} />
        </div>
        {!historyLoading && (
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <ReportHistory
              history={history}
              onView={handleViewHistory}
              onRefresh={refreshHistory} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-slate-400/50 tracking-wider">
          © {new Date().getFullYear()} Ad-Lab · Traffic Intelligence Platform
        </p>
      </footer>
    </div>
  );
};

export default Index;