import { ReportHistoryEntry, deleteReport } from "@/lib/report-history";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, Trash2 } from "lucide-react";

interface ReportHistoryProps {
  history: ReportHistoryEntry[];
  onView: (entry: ReportHistoryEntry) => void;
  onRefresh: () => void;
}

const ReportHistory = ({ history, onView, onRefresh }: ReportHistoryProps) => {
  if (history.length === 0) return null;

  const handleDelete = (id: string) => {
    deleteReport(id);
    onRefresh();
  };

  return (
    <div className="mt-10">
      <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        Recent Reports
      </h3>
      <div className="space-y-3">
        {history.map((entry) => (
          <Card key={entry.id} className="border-border/50 hover:border-accent/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{entry.businessName}</p>
                <p className="text-sm text-muted-foreground truncate">{entry.websiteUrl}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(entry.createdAt).toLocaleDateString()} · {entry.dateRange.start} — {entry.dateRange.end}
                </p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                {entry.html && (
                  <Button variant="ghost" size="sm" onClick={() => onView(entry)}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportHistory;
