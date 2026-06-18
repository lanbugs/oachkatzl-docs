---
id: action-nodes
title: Action Nodes
sidebar_position: 16
---

# Action Nodes

**Action Nodes** are special workflow nodes that perform built-in operations on [Artifact Cache](artifact-cache) data — without running a script or playbook. They are added the same way as task nodes: hover over any node on the canvas, click a condition button (✓ / ✗ / →), then choose *Action Node* in the *Add node* dialog.

:::info Source artifact
All action nodes consume an artifact produced by an earlier node. The **Source artifact tag** is set once in the *Add node* dialog and identifies the artifact by name. The workflow must have an **Artifact Cache** configured for action nodes to read from.
:::

## Available Action Node Types

| Type | What it does |
|------|-------------|
| **List Generator** | Converts a JSON array artifact to a downloadable XLSX or CSV file and stores it back in the artifact cache. |
| **PDF Generator** | Renders a Markdown or HTML artifact as a PDF and stores the result in the artifact cache. |
| **Send Mail** | Sends an email, optionally attaching an artifact file. |
| **Transfer File** | Uploads an artifact file to a remote server via SFTP or SMB. |

## List Generator

Reads a **JSON array** artifact (a list of objects) and converts it to an **XLSX** or **CSV** file. The generated file is uploaded back to the artifact cache under the configured output filename and is immediately downloadable from the UI.

The source artifact must be a JSON artifact whose top-level value is an array of objects. The object keys become column headers in the spreadsheet.

| Field | Required | Description |
|-------|----------|-------------|
| Source artifact tag | yes | Name of the JSON array artifact to convert. Set in the *Add node* dialog. |
| Output format | yes | `XLSX` (default) or `CSV`. |
| Output filename | no | Name for the generated file (e.g. `report.xlsx`). Defaults to `output.xlsx` / `output.csv`. |

**Example — uploading a list artifact from Bash for the List Generator to process:**

```bash
#!/bin/bash
PAYLOAD=$(jq -n '[
  {"host":"web-01","status":"ok","changed":3},
  {"host":"web-02","status":"ok","changed":1},
  {"host":"db-01","status":"failed","changed":0}
]')
curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"host-results\", \"data\": $PAYLOAD}"
```

Set *Source artifact tag* to `host-results` on the List Generator node. The node produces `report.xlsx` in the cache.

## PDF Generator

Reads a **Markdown** (`.md`) or **HTML** artifact, renders it as a PDF (A4 portrait, 2 cm margins), and stores the result in the artifact cache. Markdown is converted to HTML before rendering. Jinja2 templating is applied if a `data` JSON artifact with the same run token is present.

| Field | Required | Description |
|-------|----------|-------------|
| Source artifact tag | yes | Name of the Markdown or HTML artifact to render. Set in the *Add node* dialog. |
| Output filename | no | Name for the generated PDF (e.g. `report.pdf`). Defaults to `output.pdf`. |

**Example — uploading a Markdown template from Python:**

```python
import os, requests

token = os.environ["OACHKATZL_ARTIFACT_TOKEN"]
url   = os.environ["OACHKATZL_ARTIFACT_URL"]

md = """# Deployment Report

| Host   | Status |
|--------|--------|
| web-01 | OK     |
| web-02 | OK     |
"""

# Upload as a file with a .md extension
headers = {"X-Artifact-Token": token}
resp = requests.post(url, headers=headers,
                     files={"file": ("report.md", md.encode(), "text/markdown")},
                     data={"name": "report.md"})
resp.raise_for_status()
```

Set *Source artifact tag* to `report.md` on the PDF Generator node.

## Send Mail

Sends an email via the configured SMTP server (see [Notifications → SMTP configuration](notifications#smtp-configuration)). An artifact file can optionally be attached to the email.

| Field | Required | Description |
|-------|----------|-------------|
| Attachment artifact tag | no | Name of the artifact to attach. Set in the *Add node* dialog. Leave blank for no attachment. |
| To | yes | One or more recipient email addresses. |
| Subject | yes | Email subject line. |
| Body | no | Plain-text email body. |

:::info
SMTP must be configured under **Settings** before Send Mail nodes can deliver email. A test SMTP server (Mailpit) is included in the Docker Compose setup and reachable at `http://localhost:8026`.
:::

## Transfer File

Uploads an artifact file to a remote server using **SFTP** or **SMB**. The remote path supports dynamic tokens that are resolved at run time.

| Field | Required | Description |
|-------|----------|-------------|
| Source artifact tag | yes | Name of the artifact file to upload. Set in the *Add node* dialog. |
| Protocol | yes | `SFTP` (default) or `SMB`. |
| Credential | yes | A Custom Credential that supplies the connection details (host, username, password / key). |
| Remote path | yes | Destination path on the remote server. Supports path tokens (see below). |

### Remote Path Tokens

Click any token chip in the Remote Path field to insert it. Tokens are resolved at run time:

| Token | Resolves to |
|-------|------------|
| `{date}` | `YYYY-MM-DD` |
| `{datetime}` | `YYYY-MM-DDTHH-MM-SS` |
| `{year}` | 4-digit year |
| `{month}` | 2-digit month |
| `{day}` | 2-digit day |
| `{workflow_run_id}` | MongoDB ObjectId of the workflow run |
| `{workflow_name}` | Name of the workflow |
| `{node_name}` | Label of this action node |

**Example path:** `/reports/{year}/{month}/report-{date}.xlsx` → `/reports/2026/06/report-2026-06-18.xlsx`
