import { useState } from "react";
import { ReportHistoryEntry, deleteReport } from "@/lib/report-history";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock, ExternalLink, Trash2, Loader2, AlertCircle,
  CheckCircle2, Bot, CalendarDays, X
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format, isToday, isYesterday, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";

interface ReportHistoryProps {
  history: ReportHistoryEntry[];
  automatedHistory: ReportHistoryEntry[];
  onView: (entry: ReportHistoryEntry) => void;
  onRefresh: () => Promise<void>;
}

type Preset = "today" | "yesterday" | "last7" | "custom" | null;

const statusBadge = (status: ReportHistoryEntry["status"]) => {
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
      <Loader2 className="w-3 h-3 animate-spin" />
      Processing
    </span>
  );
  if (status === "error") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/50">
      <AlertCircle className="w-3 h-3" />
      Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
      <CheckCircle2 className="w-3 h-3" />
      Complete
    </span>
  );
};

const ReportHistory = ({ history, automatedHistory, onView, onRefresh }: ReportHistoryProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>(null);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (history.length === 0 && automatedHistory.length === 0) return null;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await deleteReport(deleteId);
    await onRefresh();
    setDeleting(false);
    setDeleteId(null);
  };

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    setCustomRange(undefined);
  };

  const handleClearFilter = () => {
    setActivePreset(null);
    setCustomRange(undefined);
  };

  const filterByDate = (items: ReportHistoryEntry[]) => {
    if (!activePreset) return items;
    const now = new Date();
    return items.filter((entry) => {
      const date = new Date(entry.createdAt);
      if (activePreset === "today") return isToday(date);
      if (activePreset === "yesterday") return isYesterday(date);
      if (activePreset === "last7") return date >= subDays(startOfDay(now), 6) && date <= endOfDay(now);
      if (activePreset === "custom" && customRange?.from) {
        const from = startOfDay(customRange.from);
        const to = endOfDay(customRange.to ?? customRange.from);
        return isWithinInterval(date, { start: from, end: to });
      }
      return true;
    });
  };

  const hasActiveFilter = activePreset !== null;
  const customLabel = customRange?.from
    ? customRange.to
      ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`
      : format(customRange.from, "MMM d, yyyy")
    : "Custom Range";

  const renderList = (items: ReportHistoryEntry[], emptyMsg: string) => {
    const filtered = filterByDate(items);
    if (filtered.length === 0) {
      return (
        <p className="text-sm text-slate-500 italic py-4">
          {hasActiveFilter ? "No reports match the selected date filter." : emptyMsg}
        </p>
      );
    }

    return (
      <div className="space-y-2.5">
        {filtered.map((entry, i) => (
          <Card
            key={entry.id}
            className="history-card border-slate-200/80 bg-white rounded-xl overflow-hidden animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-foreground truncate text-sm">{entry.clientName}</p>
                  {statusBadge(entry.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate">{entry.googleAdsId}</p>
                <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {entry.dateRange.start} — {entry.dateRange.end}
                </p>
              </div>
              <div className="flex gap-1.5 ml-4 shrink-0">
                {entry.html && entry.status === "complete" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(entry)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                    title="View report"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(entry.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const manualWeekly = history.filter(h => h.jobType === "weekly" || !h.jobType);
  const manualAudit = history.filter(h => h.jobType === "audit");

  // Date filter bar — shared across both tabs
  const DateFilterBar = () => (
    <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
      {(["today", "yesterday", "last7"] as const).map((preset) => {
        const labels = { today: "Today", yesterday: "Yesterday", last7: "Last 7 Days" };
        const isActive = activePreset === preset;
        return (
          <button
            key={preset}
            onClick={() => handlePreset(preset)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isActive
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
          >
            {labels[preset]}
          </button>
        );
      })}

      {/* Custom Range */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={() => {
              setActivePreset("custom");
              setCalendarOpen(true);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activePreset === "custom"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {activePreset === "custom" ? customLabel : "Custom Range"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-xl rounded-xl" align="start">
          <Calendar
            mode="range"
            selected={customRange}
            onSelect={(range) => {
              setCustomRange(range);
              if (range?.from && range?.to) {
                setCalendarOpen(false);
              }
            }}
            disabled={{ after: new Date() }}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear filter */}
      {hasActiveFilter && (
        <button
          onClick={handleClearFilter}
          className="ml-auto text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="mt-10">
      <Tabs defaultValue="recent" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Report History
          </h3>
          <TabsList className="bg-slate-100/80">
            <TabsTrigger value="recent" className="text-sm">Recent</TabsTrigger>
            <TabsTrigger value="automated" className="text-sm gap-1.5 flex items-center">
              <Bot className="w-3.5 h-3.5" />
              Automated
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Shared date filter bar */}
        <DateFilterBar />

        <TabsContent value="recent" className="animate-in fade-in duration-300">
          <Accordion type="multiple" defaultValue={["audits", "weekly"]} className="w-full space-y-4">
            <AccordionItem value="audits" className="border-none bg-slate-50/50 rounded-xl px-4 border border-slate-100 data-[state=open]:shadow-sm transition-all pb-1">
              <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-4">
                Full Account Audits
                <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
                  {filterByDate(manualAudit).length}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-1 pb-2">
                  {renderList(manualAudit, "No recent audits found.")}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="weekly" className="border-none bg-slate-50/50 rounded-xl px-4 border border-slate-100 data-[state=open]:shadow-sm transition-all pb-1">
              <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-4">
                Weekly Performance Reports
                <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
                  {filterByDate(manualWeekly).length}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-1 pb-2">
                  {renderList(manualWeekly, "No recent weekly reports found.")}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="automated" className="space-y-4 animate-in fade-in duration-300">
          <div className="text-sm text-slate-500 bg-brand-50/50 p-3 rounded-lg border border-brand-100 flex items-start gap-2">
            <Bot className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
            <p>These reports are automatically scheduled and generated by the system. They are accessible to all team members.</p>
          </div>
          {renderList(automatedHistory, "No automated reports available yet.")}
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report and its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportHistory;


