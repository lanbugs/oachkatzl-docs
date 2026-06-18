---
id: notifications
title: Notifications
sidebar_position: 20
---

# Notifications

Notification rules fire when a task completes. Rules can be scoped to a project or set globally by an admin.

## Notification Channels

| Channel | Configuration |
|---------|--------------|
| Slack | Incoming Webhook URL |
| E-Mail | Recipient selection (all members / specific members / custom addresses). Requires SMTP configured under **Settings**. |
| Telegram | Bot token + Chat ID |
| Microsoft Teams | Incoming Webhook URL |
| Gotify | Server URL + App token |

## Email Recipients

- **All members** — every project member's registered email address.
- **Specific members** — select individual members from the list.
- **Extra addresses only** — custom email addresses (useful for external recipients).

Extra addresses are always appended regardless of the member mode.

## Suppress Success Alerts

Enable this on the template to only receive notifications for *failed* runs, even if a notification rule has "on success" enabled.

## SMTP Configuration

Configure in **Settings** in the sidebar:

| Key | Example |
|-----|---------|
| SMTP_HOST | `smtp.gmail.com` |
| SMTP_PORT | `587` |
| SMTP_TLS | `true` |
| SMTP_USER | `user@gmail.com` |
| SMTP_PASSWORD | App password |
| SMTP_FROM | `oachkatzl@example.com` |

A test SMTP server (Mailpit) is included in the Docker Compose setup for development. Access it at `http://localhost:8026`.
