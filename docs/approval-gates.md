---
id: approval-gates
title: Approval Gates
sidebar_position: 15
---

# Approval Gates

An **Approval Gate** is a special workflow node that *pauses* the entire workflow run and waits for a human decision before execution continues. When the gate is reached, a modal dialog appears in the run view with a question and two choices: **Proceed** or **Cancel**.

:::info
Approval Gates are only available inside **Workflows**. They have no associated template and do not consume a task slot — they are purely a coordination mechanism.
:::

## Adding an Approval Gate to a Workflow

1. Open your workflow in the editor (**Project → Workflows → Edit**).
2. Hover over any node to reveal the toolbar and click one of the condition buttons (✓ / ✗ / →).
3. In the *Add node* dialog, click **Approval Gate** instead of Task.
4. Enter a **slug** (e.g. `deploy-approval`) — this is the artifact name your preceding task must use. Also optionally enter a **label** for display on the canvas.
5. Click *Add node*. The new node appears as an amber card with a **?** icon.

## Visual Appearance

| State | Color / border | Status badge |
|-------|---------------|--------------|
| Editor (idle) | Amber background, amber border | — |
| Run view — pending | Light slate | Pending |
| Run view — waiting for input | Amber background, amber border (pulsing) | Approval |
| Run view — approved | Green background | Success |
| Run view — rejected | Orange background | Stopped |

## What Happens When the Gate Is Reached

1. The workflow run status switches to **Awaiting Approval**.
2. All users with at least the `task_runner` role can see the run and respond.
3. A **modal dialog** appears automatically when the run view is open.
4. The modal shows a title and optional description text (sourced from an artifact — see below). If no artifact is found, *"Proceed?"* is shown as the default.
5. The user clicks **Proceed** or **Cancel**.

## Outcomes

| Decision | Gate node status | What happens next |
|----------|-----------------|-------------------|
| **Proceed** | `success` | The workflow resumes. Downstream nodes connected with *On Success* or *Always* edges are started; *On Failure* branches are skipped. |
| **Cancel** | `stopped` | The workflow is immediately stopped. All remaining *pending* nodes are marked as *skipped*. No further tasks are executed. |

## Customising the Approval Question with an Artifact

The gate reads its title and description text from a **JSON artifact** uploaded by the task that runs *immediately before* it. The artifact name must match the gate's **slug** — a short, human-readable identifier you define when creating the node.

:::info Where to set the slug
When adding a node and selecting *Approval Gate*, fill in the **Artifact slug** field (e.g. `deploy-approval`). You can also change it later by clicking the node and editing the slug in the panel below the canvas. The slug is shown on the node card in small amber monospace text.
:::

The artifact must be uploaded as a **JSON artifact** with this structure:

```json
{
  "name": "<slug>",
  "data": {
    "title": "Deploy to production?",
    "text":  "This will push version 2.4.1 to all production nodes.\nMake sure the staging tests passed."
  }
}
```

## Example — Bash Task Before the Gate

```bash
#!/bin/bash
# SLUG must match the "Artifact slug" set on the Approval Gate node in the editor
SLUG="deploy-approval"

TITLE="Deploy $APP_VERSION to production?"
TEXT="Staging tests: PASSED\nAffected hosts: web-01, web-02, web-03\nScheduled downtime: none"

curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$SLUG\", \"data\": {\"title\": \"$TITLE\", \"text\": \"$TEXT\"}}"
```

## Example — Python Task Before the Gate

```python
import os, requests

slug = "deploy-approval"   # must match the "Artifact slug" on the gate node

resp = requests.post(
    os.environ["OACHKATZL_ARTIFACT_URL"],
    headers={"X-Artifact-Token": os.environ["OACHKATZL_ARTIFACT_TOKEN"]},
    json={
        "name": slug,
        "data": {
            "title": f"Deploy {os.environ.get('APP_VERSION', '?')} to production?",
            "text":  "Staging smoke tests passed. Confirm production rollout.",
        },
    },
)
resp.raise_for_status()
```

:::info Artifact cache required
The workflow must have an **Artifact Cache** configured (Workflows editor → Artifact Cache dropdown) for the approval question text to be stored and retrieved. Without a cache, the gate still works but always shows the default *"Proceed?"* message.
:::

## Connecting Gate Outputs to Downstream Nodes

The gate node supports all three edge types:

| Edge condition | Fires when | Typical use |
|----------------|-----------|-------------|
| ✓ On Success | User clicked *Proceed* | Continue the happy path — deploy, notify, etc. |
| ✗ On Failure | — (never — rejection sets the node to *stopped*, not error) | Not typically used |
| → Always | Either decision | Cleanup / audit logging regardless of outcome |

:::warning Rejection terminates the run immediately
Unlike a failed task (which still propagates through *On Failure* edges), a rejected gate skips all remaining pending nodes and sets the run status to *stopped*. Design your workflow accordingly: add an *Always* edge if you need cleanup steps to run even after rejection.
:::

## Scheduling Workflows with Approval Gates

Workflows containing approval gates can be scheduled, but consider whether an unattended schedule makes sense — the workflow will pause indefinitely at the gate until a user responds. If no one is monitoring the run view, the workflow will remain in *Awaiting Approval* status until action is taken.
