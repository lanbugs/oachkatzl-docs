---
id: remote-approval-gate
title: Remote Approval Gate
sidebar_position: 16
---

# Remote Approval Gate

A **Remote Approval Gate** is a workflow node that pauses execution and sends approval emails to a configurable list of recipients. Each recipient receives a personal email with two unique links — one to approve, one to reject — that work **without logging in**. Once one person makes a decision, all other links are automatically invalidated.

:::info
This differs from the regular [Approval Gate](approval-gates) in one key way: the in-app modal does not appear. The decision is made entirely via email, making it suitable for approvers who do not have an Oachkatzl account.
:::

## Adding a Remote Approval Gate

1. Open the workflow editor and hover over any node.
2. Click a condition button (✓ / ✗ / →) to open the *Add node* dialog.
3. Select **Remote Approval** (indigo button).
4. Click *Add node*. The configuration dialog opens immediately.
5. Optionally enter an **Artifact slug** (the name of a JSON artifact uploaded by the preceding task — provides title and text for the email).
6. Add one or more **recipient email addresses**.
7. Click *Save*. The node appears as an indigo card with a ✉ icon.

## What Happens When the Node Is Reached

1. The workflow run switches to **Awaiting Approval** status.
2. Each recipient receives an email with the approval title and text (from the artifact if configured) and two buttons: **Approve** and **Reject**.
3. The workflow run view shows an info banner — no in-app modal appears.
4. When a recipient clicks *Approve* or *Reject*, they are shown a confirmation page. The decision is recorded in the workflow run log.
5. All other recipient links immediately become inactive. If clicked, they see a page stating who already decided and when.

## Email Content

The approval email is structured as follows:

- **Subject:** `[Approval Required] <title>`
- **Body:** The artifact title and text, followed by an Approve button and a Reject button.
- **From:** Configured `SMTP_FROM` address.

The title and text come from a JSON artifact uploaded by the preceding task. The artifact name must match the node's **Artifact slug**:

```bash
curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "deploy-approval", "data": {"title": "Deploy to production?", "text": "Version 2.4.1 — staging tests passed."}}'
```

## Approval Links

Each link is a `GET` request to a public endpoint — no session or cookie is required:

```
GET /api/remote-approval/<token>/approve
GET /api/remote-approval/<token>/reject
GET /api/remote-approval/<token>/status   ← shows current state with buttons if still pending
```

Each recipient gets their own unique token. Tokens are 256-bit URL-safe random strings and are single-use. The `/status` URL can be used to check the decision state and still act if no decision has been made yet.

## Outcomes

| Decision | Node status | What happens |
|----------|------------|--------------|
| **Approve** | `success` | Workflow resumes. Downstream *On Success* / *Always* edges fire. |
| **Reject** | `stopped` | Workflow stops immediately. All pending nodes are skipped. A workflow completion notification is sent. |

## Audit Log

Every decision is logged in the project's activity log with the email address of the person who decided and the timestamp. The decision is also visible on the workflow run node list.

## Requirements

- SMTP must be configured under **Admin → Settings**.
- The workflow must have a reachable `OACHKATZL_BASE_URL` (set in the environment) so the approval links resolve from outside the Docker network.
- An [Artifact Cache](artifact-cache) must be attached to the workflow if you want to provide a custom title/text via artifact.

:::warning
The approve / reject links work **without authentication**. Treat them like passwords — anyone who receives the email (or a forwarded copy of it) can make the decision. Do not use this feature for high-security decisions where non-repudiation is required.
:::
