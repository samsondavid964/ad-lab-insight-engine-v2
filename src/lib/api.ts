const INITIATE_URL = "https://ad-lab.app.n8n.cloud/webhook/initiate-report";
const POLL_URL = "https://ad-lab.app.n8n.cloud/webhook/poll-for-completion";

export function generateJobId(): string {
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
}

export interface InitiatePayload {
  job_id: string;
  business_name: string;
  website_url: string;
  date_range: { start: string; end: string };
}

export interface PollResponse {
  status: "pending" | "complete" | "error";
  html?: string;
  error?: string;
}

export async function initiateReport(payload: InitiatePayload): Promise<void> {
  const res = await fetch(INITIATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to initiate report: ${res.status}`);
  }
}
export async function pollForCompletion(jobId: string): Promise<PollResponse> {
  const res = await fetch(`${POLL_URL}?job_id=${encodeURIComponent(jobId)}`);
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
