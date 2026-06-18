---
id: scaling-workers
title: Scaling Workers
sidebar_position: 18
---

# Scaling Workers

Tasks are executed by **Celery workers**. By default the Docker Compose setup starts a single worker with a concurrency of 4 (4 parallel task slots). You can scale this in two ways:

## Option 1 — Increase Concurrency of a Single Worker

Set the `WORKER_CONCURRENCY` environment variable on the worker service and rebuild:

```yaml
worker:
  environment:
    WORKER_CONCURRENCY: 8   # default: 4
```

This is the simplest option and works well if your tasks are I/O-bound (waiting for SSH connections, API calls, etc.).

## Option 2 — Spawn Additional Worker Containers

Use `docker compose up --scale` to run multiple worker replicas:

```bash
# Start 3 worker containers (each with its own concurrency)
docker compose up -d --scale worker=3
```

You can also add the `deploy.replicas` setting permanently in your `docker-compose.yml`:

```yaml
worker:
  # ... existing config ...
  deploy:
    replicas: 3
```

:::info
All worker replicas share the same Redis task queue and MongoDB database — no additional configuration is needed. Tasks are distributed automatically by Celery across all available workers.
:::

## Per-Template Parallelism

By default, tasks from the same template run **sequentially** — a Redis lock prevents a second run while one is already in progress. To allow concurrent runs of the same template, enable **Allow parallel tasks** on the template.

## Beat (Scheduler) — Do Not Scale

The `beat` service (Celery Beat) must run as a **single instance only**. Running multiple Beat replicas causes duplicate task submissions. Always keep `replicas: 1` for the beat service.

## Checking Worker Status

```bash
# List active workers and their queues
docker compose exec worker celery -A app.celery_app inspect active

# Monitor via Flower (if enabled)
# http://localhost:5555
```
