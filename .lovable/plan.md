

# Ad-Lab Traffic Intelligence Report Generator

## Overview
An internal tool for Ad-Lab agency that generates beautiful, in-depth website traffic analysis reports for any client. The app sends requests to n8n via webhook using an async polling pattern, then renders the returned HTML report.

---

## Page 1: Report Request Form (Landing Page)
- **Ad-Lab branding** — Logo displayed prominently at the top, dark navy gradient header matching the report's premium design aesthetic
- **Input form** with three fields:
  - **Business Name** (text input)
  - **Website URL** (text input with URL validation)
  - **Date Range** (date range picker — start/end month selectors)
- **"Generate Report" button** — triggers the webhook call
- Clean, minimal layout with Inter + Playfair Display fonts, navy/blue palette

## Page 2: Loading / Processing State
- After submitting, the app POSTs to `https://ad-lab.app.n8n.cloud/webhook/initiate-report` with the form data
- Receives a `job_id` back instantly (HTTP 202)
- Displays a polished loading screen with:
  - Ad-Lab logo
  - Animated progress indicator
  - "Generating your report..." messaging with the business name
  - Estimated wait time note (~1 minute)
- **Polling**: Pings `https://ad-lab.app.n8n.cloud/webhook/poll-for-completion?job_id=XXX` every 5 seconds
- Timeout after ~3 minutes with a friendly error/retry message

## Page 3: Report Display
- Once polling returns the completed HTML, render it in a styled iframe/container
- The report follows the exact design of the attached reference — tabbed sections for Executive Summary, Traffic Analysis, Channel Mix, Geographic, Competitors, Keywords, and Action Plan
- **Download as HTML** button to save the report locally
- **Generate New Report** button to return to the form

## Design & Branding
- Ad-Lab logo used as favicon and in the landing page header
- Color palette: Navy/dark blue gradient header, white cards, blue accents
- Typography: Playfair Display for headings, Inter for body text
- Premium, agency-grade aesthetic

## Report History
- Local storage of previously generated reports (business name, date, job_id)
- Quick-access list on the landing page to re-view past reports

