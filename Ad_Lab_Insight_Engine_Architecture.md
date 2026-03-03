# Ad-Lab Insight Engine Architecture & Overview

## Application Overview
**Ad-Lab Insight Engine** is a React-based web application designed to generate and manage automated reports for various clients. The platform offers an AI-powered data intelligence dashboard that creates in-depth traffic analysis, account audits, and client competitor reports in minutes. 

It provides an intuitive user interface mimicking a modern SaaS platform with quick stats, animated interactions, and dynamic form generation tailored for specific report types.

---

## Technology Stack
- **Frontend Framework**: React 18, Vite
- **Styling**: Tailwind CSS, Shadcn UI (Radix Primitives), Lucide Icons
- **Routing**: React Router (`react-router-dom`)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Data modeling)
- **Workflow Automation**: n8n Webhooks
- **State Management & Data Fetching**: React Query (`@tanstack/react-query`)
- **Utilities**: `date-fns` for date manipulation, `react-hook-form` for complex forms.

---

## Core Workflows & Features

### 1. Authentication (`src/contexts/AuthContext.tsx` & `src/pages/Auth.tsx`)
The application is wrapped with a comprehensive authentication layer interacting directly with Supabase Auth:
- **Routes & Protection**: All authenticated routes (e.g., the primary dashboard) are protected by a `<ProtectedRoute>` component.
- **Login/Signup Flow**: Uses Supabase features allowing seamless transitions into the main app via a dedicated Auth page.

### 2. Main Dashboard (`src/pages/Index.tsx`)
The user lands on the Dashboard after signing in. The dashboard integrates:
- **Quick Stats**: Shows a count of total generated reports, recent reports from this week, and the date of the last report generated. The data aggregates from both manual runs and global automated systems.
- **Three Report Forms**: 
  - **Weekly Performance Report**: Standard performance metrics.
  - **Account Audit**: Deep-dive account structure analysis.
  - **Client Competitor Analysis**: Competitive landscape report.

### 3. Report Generation Process
The generation runs sequentially spanning the frontend, Supabase, and a remote n8n server (`src/lib/api.ts`).

1. **Initiation**: When users submit a request, the app first creates a "pending" job entry in the `report_jobs` table in Supabase via `src/lib/report-history.ts`.
2. **Webhooks**: An HTTP POST request is then dispatched to specific n8n webhooks based on the chosen report type (e.g., `https://ad-lab.app.n8n.cloud/webhook/initiate-report`). The request is authenticated using a Bearer token stored in `.env`.
3. **Polling**: The application enters a loading state (`LoadingState.tsx`), polling a separate webhook periodically (`/webhook/poll-for-completion`) indicating the job processing status.
4. **Completion**: Once n8n has completed aggregating the data and creating the report format, the response brings back an HTML string containing the full report.
5. **Database Update**: Supabase is updated to reflect the new `complete` status along with the generated plain-text/HTML payload.

### 4. Viewing and Managing Reports
- **Report Viewer (`ReportViewer.tsx`)**: Displays the final HTML payload directly within the platform.
- **Report History (`ReportHistory.tsx`)**: Fetches historical data directly from Supabase. Reports are neatly grouped into an accordion interface categorizing them into Full Audits, Weekly Performance, and Competitor Reports.
- **Automated vs Manual**: Uses a unified layout to distinguish between user-generated models vs "Automated" global reports fetched exclusively tracking the `user_id` mapped to an automated global bot.
- **Date Filtering**: Supports custom date filters leveraging `date-fns` and Shadcn UI's Calendar component, ensuring swift discovery of historical analysis.

---

## Project Structure
- `src/components/`: Reusable interface components. Features `ReportForm`, `CompetitorReportForm`, loading states, nested UI fragments (like Shadcn button, accordion, card, toast, etc.).
- `src/pages/`: Core application views. Includes Index (Dashboard), Auth, SharedReport, and an error catch-all.
- `src/lib/`: Essential business logic functions. API bridging (`api.ts`), Report history CRUD models (`report-history.ts`), and static client lists (`clients.ts`).
- `src/integrations/supabase/`: Setup parameters mapping the frontend into the remote Supabase PostgreSQL database.

## Summary
The **Ad-Lab Insight Engine** seamlessly ties a modern React frontend architecture to a high-powered workflow generation backend via **n8n** and robust database storage via **Supabase**. Its separation between initiating requests, constant polling, and database history abstraction ensures durability while maintaining a sleek, uninterrupted user experience for its agency analysts across multiple report verticals.
