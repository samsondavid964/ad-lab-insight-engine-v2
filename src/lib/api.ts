const WEEKLY_INITIATE_URL = "https://ad-lab.app.n8n.cloud/webhook/initiate-report";
const WEEKLY_POLL_URL = "https://ad-lab.app.n8n.cloud/webhook/poll-for-completion";

const AUDIT_INITIATE_URL = "https://ad-lab.app.n8n.cloud/webhook/initiate-audit";
const AUDIT_POLL_URL = "https://ad-lab.app.n8n.cloud/webhook/poll-for--audit-completion";
const WEBHOOK_KEY = import.meta.env.VITE_WEBHOOK_KEY || "";

export function generateJobId(): string {
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
}

export interface InitiatePayload {
  job_id: string;
  client_name: string;
  google_ads_id: string;
  date_range: { start: string; end: string };
  reportType?: "weekly" | "audit";
}

export interface PollResponse {
  status: "pending" | "complete" | "error";
  html?: string;
  error?: string;
}

export async function initiateReport(payload: InitiatePayload): Promise<void> {
  const { reportType = "weekly", ...bodyPayload } = payload;
  const url = reportType === "audit" ? AUDIT_INITIATE_URL : WEEKLY_INITIATE_URL;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${WEBHOOK_KEY}`
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    throw new Error(`Failed to initiate report: ${res.status}`);
  }
}
export async function pollForCompletion(jobId: string, reportType: "weekly" | "audit" = "weekly"): Promise<PollResponse> {
  const url = reportType === "audit" ? AUDIT_POLL_URL : WEEKLY_POLL_URL;
  const res = await fetch(`${url}?job_id=${encodeURIComponent(jobId)}`, {
    headers: {
      "Authorization": `Bearer ${WEBHOOK_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Poll failed: ${res.status}`);

  const text = await res.text();
  const data = JSON.parse(text);

  // Handle case where html might be double-encoded
  if (data.status === "complete" && data.html) {
    let html = data.html;
    if (html.startsWith('"') || html.startsWith('\\"')) {
      try { html = JSON.parse(html); } catch { /* use as-is */ }
    }
    return { status: "complete", html };
  }

  return data;
}
