export interface ReportHistoryEntry {
  id: string;
  businessName: string;
  websiteUrl: string;
  dateRange: { start: string; end: string };
  jobId: string;
  createdAt: string;
  html?: string;
}

const STORAGE_KEY = "adlab-report-history";

export function getReportHistory(): ReportHistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReport(entry: ReportHistoryEntry): void {
  const history = getReportHistory();
  const existing = history.findIndex((h) => h.id === entry.id);
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.unshift(entry);
  }
  // Keep last 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
}

export function getReport(id: string): ReportHistoryEntry | undefined {
  return getReportHistory().find((h) => h.id === id);
}

export function deleteReport(id: string): void {
  const history = getReportHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
