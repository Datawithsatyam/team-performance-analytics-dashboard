# Project Overview

## Project Name

Team Performance & Operational Analytics Dashboard

## Background

The dashboard was designed around a common operational reporting problem: task-level operational information is maintained in spreadsheets, but manually reviewing those records can make it difficult for managers to quickly identify performance issues.

The objective was to transform the task records into a simple, manager-friendly dashboard.

## Problem Statement

Managers need a centralized way to monitor:

- Task completion
- Incomplete work
- Requeued work
- Completion rates
- Organization-level performance
- Task duration
- Operational bottlenecks
- Recurring failure reasons

## Solution

Google Sheets is used as the operational data source. Google Apps Script reads and processes the records, while the HTML/JavaScript dashboard presents the resulting metrics and charts.

## Main Analytical Steps

1. Read task-level records
2. Apply date filtering
3. Classify task status
4. Aggregate by agent
5. Aggregate by organization
6. Analyze incomplete/requeue reasons
7. Calculate KPIs
8. Identify bottlenecks
9. Generate rule-based alerts
10. Display the results in the dashboard

## Main KPIs

### Completion Rate

```text
Completed Tasks / Total Tasks
```

### Incomplete Rate

```text
Incomplete Tasks / Total Tasks
```

### Requeue Rate

```text
Requeued Tasks / Total Tasks
```

### Average Duration

Average of available task/call duration records.

## Bottleneck Logic

Organizations are ranked by operational issue rates. The dashboard highlights the top three organizations requiring additional attention based on incomplete and requeue rates.

## Alert Logic

The dashboard can surface:

- High incomplete rates
- Repeated incomplete/requeue reasons
- Multiple requeues
- Unusually high average duration

These are indicators for investigation and should not be treated as automatic conclusions about an employee.

## Design Philosophy

The project was intentionally kept practical and understandable. It focuses on useful operational reporting instead of adding unnecessary complexity.
