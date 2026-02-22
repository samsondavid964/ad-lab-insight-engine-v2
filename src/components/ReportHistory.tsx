import { useState } from "react";
import { ReportHistoryEntry, deleteReport } from "@/lib/report-history";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Clock, ExternalLink, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ReportHistoryProps {
  history: ReportHistoryEntry[];
  onView: (entry: ReportHistoryEntry) => void;
  onRefresh: () => Promise<void>;
}

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

const ReportHistory = ({ history, onView, onRefresh }: ReportHistoryProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (history.length === 0) return null;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await deleteReport(deleteId);
    await onRefresh();
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="mt-10">
      <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        Recent Reports
      </h3>
      <div className="space-y-2.5">
        {history.map((entry, i) => (
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
