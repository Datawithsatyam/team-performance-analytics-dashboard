# Team Performance & Operational Analytics Dashboard

An interactive operational analytics dashboard designed to help managers monitor daily task completion, identify bottlenecks, track performance indicators, and surface operational issues requiring attention.

The project uses **Google Sheets + Google Apps Script + HTML/CSS/JavaScript + Chart.js**.

## Dashboard

The dashboard provides:

- Completed task count
- Completion rate
- Incomplete task count
- Requeue rate
- Average task duration
- Daily target and attainment
- Operational risk
- Agent filtering
- Date filtering
- Organization-level performance
- Incomplete/requeue reason breakdown
- Seven-day trend
- Operational bottlenecks
- Individual organization scorecards
- Rule-based operational alerts

## Business Problem

Operational teams often maintain task-level records in spreadsheets. Although the information is available, managers may need to manually review large amounts of data to understand performance, identify bottlenecks, and determine where attention is required.

This project converts those operational records into a centralized management dashboard.

## Analytical Workflow

1. Read operational records from Google Sheets
2. Apply date filters
3. Categorize task outcomes
4. Aggregate results by agent and organization
5. Calculate performance KPIs
6. Analyze incomplete and requeue reasons
7. Identify operational bottlenecks
8. Generate rule-based alerts
9. Present the results through an interactive dashboard

## Technology

- Google Sheets
- Google Apps Script
- JavaScript
- HTML
- CSS
- Chart.js

## Data Privacy

The project is intended for portfolio demonstration.

The sample operational data should be anonymized. Do not publish real employee information, customer information, company data, private spreadsheet URLs, credentials, access tokens, or personal email addresses.

## Repository Structure

```text
team-performance-analytics-dashboard/
│
├── README.md
├── Code.gs
├── Index.html
├── .gitignore
│
├── documentation/
│   ├── PROJECT_OVERVIEW.md
│   ├── DATA_DICTIONARY.md
│   └── SETUP_GUIDE.md
│
└── screenshots/
    ├── dashboard-team-view.png
    ├── dashboard-agent-view.png
    ├── bottlenecks-scorecard.png
    └── operational-alerts.png
```

## Important

The Google Sheet is the data source and is intentionally **not included in this repository**.

The Apps Script deployment URL is also not included. `Code.gs` contains a placeholder where a private deployment URL can be configured.

## Portfolio Context

This project demonstrates practical spreadsheet analytics, KPI design, dashboard development, operational reporting, basic automation, and data-driven problem solving.
