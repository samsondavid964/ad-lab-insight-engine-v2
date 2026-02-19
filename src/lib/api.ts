const INITIATE_URL = "https://ad-lab.app.n8n.cloud/webhook/initiate-report";
const POLL_URL = "https://ad-lab.app.n8n.cloud/webhook/poll-for-completion";

export interface InitiatePayload {
  business_name: string;
  website_url: string;
  date_range: { start: string; end: string };
}

export interface InitiateResponse {
  job_id: string;
}

export interface PollResponse {
  status: "pending" | "complete" | "error";
  html?: string;
  error?: string;
}

export async function initiateReport(payload: InitiatePayload): Promise<InitiateResponse> {
  const res = await fetch(INITIATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to initiate report: ${res.status}`);
  }

  return res.json();
}

export async function pollForCompletion(jobId: string): Promise<PollResponse> {
  const res = await fetch(`${POLL_URL}?job_id=${encodeURIComponent(jobId)}`);

  if (!res.ok) {
    throw new Error(`Poll failed: ${res.status}`);
  }

  return res.json();
}
