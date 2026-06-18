---
id: dashboard
title: Dashboard
sidebar_position: 2
---

# Dashboard

The dashboard is the first screen after login. It gives a live overview of task activity and worker health across all your projects.

## Task Chart — Last 7 Days

A line chart shows the number of **successful** (green) and **failed** (red) tasks per day for the past seven days. Hover over a data point to see the exact counts. The totals for the period are shown below the chart.

## Worker Status

Each active [Worker Pool](custom-workers) is shown as a card with:

| Value | Meaning |
|-------|---------|
| Workers online | Number of Celery worker processes currently connected to the broker. |
| Workers busy | Workers currently executing at least one task. |
| Active tasks | Total number of tasks running right now across all workers in this pool. |
| Capacity | Total available task slots (sum of each worker's concurrency setting). |

The worker status refreshes automatically every 15 seconds. A pool card turns amber when all capacity is used.

:::info
The default worker pool (*celery*) is always shown. Custom pools appear only when at least one worker for that pool is online.
:::
