# Setup Guide

## Requirements

- Google account
- Google Sheets
- Google Apps Script
- Modern web browser

## 1. Prepare the Google Sheet

Use your existing anonymized Google Sheet as the data source.

Keep the existing sheet names and structure used by the dashboard.

The Apps Script currently excludes:

- `Call FLow Generic Guide`
- `Dropdownitems`

## 2. Open Apps Script

In the Google Sheet, go to:

**Extensions → Apps Script**

## 3. Add Code.gs

Replace the Apps Script code with the contents of `Code.gs`.

## 4. Add Index.html

Create an HTML file named:

```text
Index
```

Copy the contents of `Index.html` into that file.

## 5. Configure the Web App URL

For GitHub, `Code.gs` intentionally contains:

```javascript
const webAppUrl = "YOUR_DEPLOYED_WEB_APP_URL";
```

Keep this placeholder in the public repository.

In your private Apps Script project, replace it with your actual deployment URL if you use the spreadsheet menu shortcut.

## 6. Test

Verify:

- Agent filter
- Date filter
- KPI values
- Organization chart
- Reasons breakdown
- Seven-day trend
- Bottlenecks
- Scorecard
- Operational alerts

## 7. Deploy

In Apps Script:

**Deploy → New deployment → Web app**

Configure access according to your intended portfolio demonstration.

Use anonymized data only.

## 8. Security Checklist

Before making the GitHub repository public, confirm that it does not contain:

- Real company names
- Real employee information
- Customer information
- Private spreadsheet links
- Personal email addresses
- API keys
- Passwords
- Access tokens
- Private deployment identifiers

## Note

The Google Sheet itself is intentionally kept outside GitHub. The repository contains the code, documentation and screenshots needed to explain the project.
