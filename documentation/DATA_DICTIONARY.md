# Data Dictionary

The dashboard uses anonymized operational task records stored in Google Sheets.

## Core Fields

| Field | Description |
|---|---|
| Agent Name | Team member associated with the task record |
| Reason | Reason associated with an incomplete or requeued task |
| Activity | Task outcome or activity description |
| Organization | Organization/business area associated with the task |
| Date | Date associated with the task activity |
| Call Duration | Duration associated with the task/call |

## Derived Fields

| Field | Description |
|---|---|
| Status | Categorizes a task as Completed, Incomplete or Requeued |
| Completion Rate | Percentage of total tasks completed |
| Incomplete Rate | Percentage of total tasks marked incomplete |
| Requeue Rate | Percentage of total tasks requeued |
| Average Duration | Average available duration |
| Risk | Basic operational risk classification |
| Bottleneck | Organization identified for additional attention |
| Alert Type | Category of operational alert |

## Status Logic

### Completed

The activity contains:

- `Completed`
- `Success`

### Requeued

The activity contains:

- `Requeued`

### Incomplete

Remaining valid activity records are classified as incomplete.

## Privacy

All portfolio data should be anonymized. Agent names and organization names should be fictional.
