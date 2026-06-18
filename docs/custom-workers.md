---
id: custom-workers
title: Custom Workers
sidebar_position: 19
---

# Custom Workers

A **Worker Pool** is a named Celery queue that a dedicated worker container listens to. Custom worker images — with additional binaries, GPU drivers, specific Python packages, or restricted network access — register themselves by setting a single environment variable. Templates and Custom Apps can then target that pool, so only the matching worker executes those tasks.

:::info
The default worker listens to the built-in `celery` queue. All templates that have no pool assigned continue to run there as before. Custom pools are completely opt-in and additive.
:::

## Step 1 — Define a Worker Pool (Admin)

Go to **Settings → Worker Pools** in the sidebar and click *New pool*. The **slug** is the Celery queue name — it must match exactly what the worker container advertises.

| Field | Description |
|-------|-------------|
| `slug` | Celery queue name. Lowercase letters, digits, `-` and `_`. Immutable after creation. Example: `gpu`, `ansible-extended`. |
| `name` | Human-readable display name shown in dropdowns. |
| `description` | Optional — what this pool is for, what tools it provides. |
| `active` | Inactive pools are hidden from dropdowns but existing assignments are preserved. |

## Step 2 — Start a Worker that Consumes the Pool

Tell the worker which queue to consume via the `OACHKATZL_WORKER_QUEUES` environment variable. The variable is passed directly to Celery's `-Q` flag.

```yaml
# docker-compose.yml — add a second worker service
worker-gpu:
  image: my-gpu-worker:latest      # custom image with CUDA, tensorflow, etc.
  command: >-
    sh -c "celery -A worker.celery worker -l info -c 2 -Q $$OACHKATZL_WORKER_QUEUES"
  env_file: .env
  environment:
    OACHKATZL_WORKER_QUEUES: "gpu"
    OACHKATZL_PIP_INDEX_URL: "http://devpi:3141/root/pypi/+simple/"
  depends_on:
    mongo: { condition: service_healthy }
    redis: { condition: service_healthy }
  volumes:
    - /tmp/oachkatzl:/tmp/oachkatzl
```

The container can be any image that includes the Oachkatzl backend code and the additional tools you need. Use the official worker image as a base and layer your dependencies on top:

```dockerfile
# Dockerfile.worker-gpu
FROM lanbugsde/oachkatzl-worker:latest

# Install extra system packages
RUN apt-get update && apt-get install -y terraform kubectl && rm -rf /var/lib/apt/lists/*

# Install extra Python packages
RUN pip install boto3 kubernetes
```

:::info Multiple queues on one worker
Set a comma-separated list to consume several queues at once — e.g. `OACHKATZL_WORKER_QUEUES=gpu,default`. This is useful for a "catch-all" secondary worker that handles both custom and default tasks.
:::

## Step 3 — Assign a Pool to a Template

Open the template editor. If at least one Worker Pool exists, a **Worker pool** dropdown appears in the *Basic info* section. Select the pool; the hint below the dropdown shows the queue name the worker must listen to.

Leave it at *Default worker* to keep using the standard `celery` queue.

## Step 4 — Assign a Pool to a Custom App (Optional)

In **Settings → Custom Apps**, each app can have a **default worker pool**. This pool applies automatically to every template that uses this app type — unless the template overrides it with its own pool selection.

Use this to guarantee, for example, that the `terraform` custom app always runs on a worker that has Terraform installed, without requiring every template author to remember to set the pool.

## Pool Resolution Order

When a task is enqueued, the target queue is resolved in this priority order:

1. **Template's worker pool** — set directly on the template (highest priority).
2. **Custom App's worker pool** — the default pool of the app type used by the template.
3. **Default queue** (`celery`) — if neither template nor app specifies a pool.

## Environment Variable Reference

| Variable | Set on | Description |
|----------|--------|-------------|
| `OACHKATZL_WORKER_QUEUES` | Worker container | Comma-separated list of Celery queue names this worker consumes. Default: `celery`. Must match the *slug* of the Worker Pool defined in the UI. |

## Verifying the Setup

```bash
# List active workers and the queues they are listening to
docker compose exec worker celery -A worker.celery inspect active_queues

# Inspect the custom worker container
docker compose exec worker-gpu celery -A worker.celery inspect active_queues
```

Create a template, assign it to your custom pool, and trigger a task. The task should appear in the log of the custom worker container — not the default one.

:::warning No worker running for a pool?
If a task is enqueued to a queue that no worker is consuming, it remains in `waiting` status indefinitely. Oachkatzl does not currently detect this automatically. Always ensure at least one worker is started for every active pool that templates use.
:::

## Practical Example — Terraform Runner

Goal: run Terraform plans and applies on a dedicated worker with the correct binary and cloud credentials pre-installed.

1. Create a Worker Pool: slug `terraform`, name *Terraform Worker*.
2. Build a custom image with `terraform` in `/usr/local/bin`.
3. Add a `worker-terraform` service in `docker-compose.yml` with `OACHKATZL_WORKER_QUEUES=terraform`.
4. Register a Custom App: slug `terraform`, executable `/usr/local/bin/terraform`, default pool → *Terraform Worker*.
5. Create templates using app type *terraform* — they automatically target the Terraform worker. No per-template pool selection needed.
