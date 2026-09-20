Team Performance & Operational Analytics Dashboard

An interactive operational analytics dashboard designed to help managers monitor task completion, analyze team and agent performance, identify bottlenecks, and surface operational issues requiring attention.

The project uses Google Sheets + Google Apps Script + HTML/CSS/JavaScript + Chart.js.

Dashboard Preview

Team Overview



Agent-Level Analysis



Bottlenecks & Trend Analysis



Operational Alerts



Agent Scorecard



Business Problem

Operational teams often maintain task-level records in spreadsheets. Although the information is available, managers may need to manually review large amounts of data to understand performance, identify bottlenecks, and determine where attention is required.

This project converts operational records into a centralized dashboard that provides structured KPIs, performance breakdowns, trend analysis, bottleneck identification, and rule-based operational alerts.

Project Objectives

The dashboard was designed to help operational teams:

Monitor team-level performance

Analyze individual agent performance

Track task completion and requeue patterns

Analyze incomplete and requeue reasons

Compare performance against daily targets

Identify operational bottlenecks

Review short-term performance trends

Surface potential operational issues using predefined rules

Key KPIs

KPI

Description

Completed Tasks

Number of records classified as completed

Completion Rate

Percentage of records classified as completed

Incomplete Tasks

Number of records classified as incomplete

Requeue Rate

Percentage of records classified as requeued

Average Task Duration

Average duration of recorded activities

Daily Target

Expected operational output for the selected context

Daily Attainment

Performance compared with the daily target

Operational Risk

Rule-based assessment derived from selected performance indicators

Dashboard Features

Team & Agent Analysis

The dashboard supports both team-level and agent-level analysis using:

Agent filtering

Date-range filtering

KPI cards

Performance summaries

Organization-level breakdowns

Reason Analysis

Incomplete and requeued records can be analyzed by their associated reasons to identify recurring operational issues.

Trend Analysis

A seven-day trend provides a short-term view of operational activity and performance patterns.

Bottleneck Analysis

The dashboard identifies operational bottlenecks using predefined rules and thresholds.

Agent Scorecards

Agent scorecards provide a structured view of individual performance indicators to support operational review.

Operational Alerts

Rule-based alerts highlight conditions that may require attention.

These alerts are based on predefined business rules and thresholds. They are not machine-learning predictions.

Analytical Workflow

Raw Operational Records
          ↓
Data Filtering
          ↓
Status Classification
          ↓
KPI Calculation
          ↓
Agent & Organization Aggregation
          ↓
Trend Analysis
          ↓
Bottleneck Analysis
          ↓
Operational Alerts
          ↓
Interactive Dashboard

The workflow converts task-level operational records into metrics and visual outputs that can be used for day-to-day performance monitoring.

Technology Stack

Data & Automation

Google Sheets

Google Apps Script

Development

JavaScript

HTML

CSS

Visualization

Chart.js

Documentation & Version Control

Markdown

GitHub

Repository Structure

team-performance-analytics-dashboard/
│
├── README.md
├── Code.gs
├── Index.html
│
├── documentation/
│   ├── PROJECT_OVERVIEW.md
│   ├── DATA_DICTIONARY.md
│   └── SETUP_GUIDE.md
│
└── screenshots/
    ├── dashboard-team-view.jpeg
    ├── dashboard-agent-view.jpeg
    ├── bottlenecks-trend-analysis.jpeg
    ├── operational-alerts.jpeg
    └── scorecard.jpeg

Documentation

Additional project documentation is available in the documentation/ directory:

Project Overview

Data Dictionary

Setup Guide

Data Privacy

This repository is intended for portfolio demonstration.

The actual Google Sheet used as the dashboard's data source is not included in this repository.

Real employee information, customer information, company data, private spreadsheet URLs, credentials, access tokens, and personal email addresses should not be published in a public repository.

The Apps Script deployment URL used in a private working environment should also remain separate from the public repository.

What I Learned

Through this project, I practiced:

Converting raw operational records into structured analytical metrics

Defining KPIs for operational performance

Building data classification and aggregation logic using JavaScript

Creating team, organization, and agent-level performance views

Designing rule-based operational alerts

Building interactive date and agent filters

Performing trend and bottleneck analysis

Translating operational problems into measurable analytical outputs

Documenting an end-to-end analytics project for a portfolio

Future Improvements

Potential future improvements include:

Adding additional operational datasets

Historical performance comparisons

SQL-based data extraction

Building a Power BI version of the dashboard

Expanding trend analysis beyond the current short-term view

Exploring more advanced anomaly-detection techniques

These are potential extensions and are not currently implemented in this version.

Project Status

Completed — Portfolio Version

The current version includes the core dashboard, analytical logic, documentation, and portfolio screenshots.

Author

Satyam Sharma

Aspiring Data Analyst focused on:

SQL

Excel

Power BI

Python

Operational Analytics

Business Analysis

GitHub: Datawithsatyam
