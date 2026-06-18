---
id: artifact-cache
title: Artifact Cache
sidebar_position: 16
---

# Artifact Cache

An **Artifact Cache** lets tasks persistently store files and JSON data during execution and retrieve them later — from the same task, a downstream workflow node, or the project UI. Each task run gets an injected **token** that authenticates all upload and list calls.

## Setup

1. Open your project and navigate to **Artifact Caches** in the sidebar.
2. Click *New cache*, give it a name and a retention period (0 = never expire).
3. Open a template or workflow, scroll to the **Artifact Cache** section and select the cache.

## Injected Environment Variables

When a task starts and its template (or workflow) has a cache configured, Oachkatzl injects five variables into the subprocess environment:

| Variable | Reaches | Use when |
|----------|---------|----------|
| `OACHKATZL_ARTIFACT_TOKEN` | — | Auth token for upload / list calls (scoped to this run). |
| `OACHKATZL_ARTIFACT_URL` | Internal Docker network (`http://api:5000`) | Script runs *inside* a Docker task (Bash, Python, Ansible on localhost). |
| `OACHKATZL_ARTIFACT_LIST_URL` | Internal Docker network | Same — listing artifacts from within the worker. |
| `OACHKATZL_ARTIFACT_URL_EXT` | External URL (`OACHKATZL_BASE_URL`) | Passing the URL to a remote host or an external system. |
| `OACHKATZL_ARTIFACT_LIST_URL_EXT` | External URL | Same — listing from an external system. |

:::info Which URL to use?
Scripts that run directly on the worker container (Bash, Python, Ansible with `hosts: localhost`) should use `OACHKATZL_ARTIFACT_URL` — it goes directly to the API container over the Docker network, bypassing nginx. Use `OACHKATZL_ARTIFACT_URL_EXT` only when you need to reach the API from a remote machine.
:::

:::info Workflows
All nodes in a workflow share the *same token*. A downstream node can therefore read artifacts uploaded by an earlier node without any extra configuration.
:::

## Uploading a File — Shell / Bash

```bash
#!/bin/bash
# Upload a binary or text file
curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -F "name=report.tar.gz" \
  -F "file=@/tmp/report.tar.gz"

# Upload a plain-text log
curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -F "name=output.log" \
  -F "file=@/var/log/myapp.log"
```

## Uploading JSON — Shell / Bash

```bash
#!/bin/bash
# Upload a JSON object (any valid JSON value)
curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "results.json", "data": {"hosts_ok": 5, "hosts_failed": 0}}'

# Upload a JSON array (downloadable as CSV from the UI)
PAYLOAD=$(jq -n '[
  {"host":"web-01","status":"ok","changed":3},
  {"host":"web-02","status":"ok","changed":1}
]')
curl -s -X POST "$OACHKATZL_ARTIFACT_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"hosts.json\", \"data\": $PAYLOAD}"
```

## Listing Artifacts — Shell

```bash
#!/bin/bash
# Returns a JSON array of all artifacts in the current run
curl -s "$OACHKATZL_ARTIFACT_LIST_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" | jq .

# Example output:
# [
#   {"id": "abc123", "name": "results.json", "artifact_type": "json", "size_bytes": 82, ...},
#   {"id": "def456", "name": "report.tar.gz", "artifact_type": "file", "size_bytes": 14302, ...}
# ]
```

## Downloading an Artifact in a Downstream Task — Shell

```bash
#!/bin/bash
# Step 1: find the artifact by name
AID=$(curl -s "$OACHKATZL_ARTIFACT_LIST_URL" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  | jq -r '.[] | select(.name=="results.json") | .id')

# Step 2: derive download URL from list URL
BASE=$(echo "$OACHKATZL_ARTIFACT_LIST_URL" | sed 's|/list$||')

# Step 3: download the file
curl -s "$BASE/$AID/download" \
  -H "X-Artifact-Token: $OACHKATZL_ARTIFACT_TOKEN" \
  -o /tmp/results.json

cat /tmp/results.json
```

## Uploading a File — Python

```python
import os, requests

token = os.environ["OACHKATZL_ARTIFACT_TOKEN"]
url   = os.environ["OACHKATZL_ARTIFACT_URL"]

# File upload — do NOT set Content-Type here.
# requests sets "multipart/form-data; boundary=..." automatically.
# If Content-Type is already present in headers, requests will NOT override it,
# and the server will reject the request with 400.
file_headers = {"X-Artifact-Token": token}

with open("/tmp/report.tar.gz", "rb") as f:
    resp = requests.post(url, headers=file_headers,
                         files={"file": f},
                         data={"name": "report.tar.gz"})
    resp.raise_for_status()
    print("Uploaded:", resp.json())
```

## Uploading JSON — Python

```python
import os, requests

token = os.environ["OACHKATZL_ARTIFACT_TOKEN"]
url   = os.environ["OACHKATZL_ARTIFACT_URL"]

# JSON upload — use requests' json= parameter, which sets Content-Type automatically.
json_headers = {"X-Artifact-Token": token}

data = {
    "name": "scan_results.json",
    "data": [
        {"host": "web-01", "open_ports": [22, 80, 443]},
        {"host": "db-01",  "open_ports": [22, 5432]},
    ]
}
resp = requests.post(url, headers=json_headers, json=data)
resp.raise_for_status()
print("Artifact ID:", resp.json()["id"])
```

## Reading Artifacts in a Downstream Task — Python

```python
import os, requests

token    = os.environ["OACHKATZL_ARTIFACT_TOKEN"]
list_url = os.environ["OACHKATZL_ARTIFACT_LIST_URL"]
headers  = {"X-Artifact-Token": token}

# List all artifacts in this run (includes those from earlier nodes)
artifacts = requests.get(list_url, headers=headers).json()

# Find and download a specific artifact
for art in artifacts:
    if art["name"] == "scan_results.json":
        base = list_url.replace("/list", "")
        content = requests.get(f"{base}/{art['id']}/download",
                               headers=headers).json()
        print(content)
        break
```

## Uploading a File — Ansible

Use the `uri` module to call the artifact API from within a playbook. The injected environment variables are available via `ansible.builtin.shell` or directly as Jinja2 lookups.

```yaml
---
- name: Upload artifact from Ansible
  hosts: localhost
  gather_facts: false
  tasks:

    # 1. Read injected variables from the worker environment
    - name: Get artifact vars
      ansible.builtin.set_fact:
        artifact_token: "{{ lookup('env', 'OACHKATZL_ARTIFACT_TOKEN') }}"
        artifact_url:   "{{ lookup('env', 'OACHKATZL_ARTIFACT_URL') }}"

    # 2. Upload a JSON report
    #    Important: do NOT set Content-Type in headers when using body_format: json.
    #    body_format: json sets it automatically AND handles serialisation.
    - name: Upload JSON report
      ansible.builtin.uri:
        url: "{{ artifact_url }}"
        method: POST
        headers:
          X-Artifact-Token: "{{ artifact_token }}"
        body_format: json
        body:
          name: "ansible_report.json"
          data:
            play: "{{ ansible_play_name }}"
            hosts_ok: "{{ ansible_stats.ok | default({}) | length }}"
        status_code: [200, 201]
      register: upload_result

    - name: Show artifact ID
      ansible.builtin.debug:
        msg: "Stored with ID {{ upload_result.json.id }}"

    # 3. Upload a file (e.g., a generated archive)
    - name: Upload tar archive
      ansible.builtin.shell: |
        curl -s -X POST "{{ artifact_url }}" \
          -H "X-Artifact-Token: {{ artifact_token }}" \
          -F "name=backup.tar.gz" \
          -F "file=@/tmp/backup.tar.gz"
```

## Reading Artifacts from an Earlier Node — Ansible

```yaml
---
- name: Download artifact uploaded by a previous workflow node
  hosts: localhost
  gather_facts: false
  tasks:

    - name: Get artifact vars
      ansible.builtin.set_fact:
        artifact_token:    "{{ lookup('env', 'OACHKATZL_ARTIFACT_TOKEN') }}"
        artifact_list_url: "{{ lookup('env', 'OACHKATZL_ARTIFACT_LIST_URL') }}"

    - name: List artifacts
      ansible.builtin.uri:
        url: "{{ artifact_list_url }}"
        method: GET
        headers:
          X-Artifact-Token: "{{ artifact_token }}"
        return_content: true
      register: artifact_list

    - name: Find scan_results.json
      ansible.builtin.set_fact:
        scan_artifact: >-
          {{ artifact_list.json
             | selectattr('name', 'equalto', 'scan_results.json')
             | first }}

    - name: Download artifact
      ansible.builtin.uri:
        url: "{{ artifact_list_url | regex_replace('/list$', '') }}/{{ scan_artifact.id }}/download"
        method: GET
        headers:
          X-Artifact-Token: "{{ artifact_token }}"
        return_content: true
      register: scan_data

    - name: Show scan results
      ansible.builtin.debug:
        var: scan_data.json
```

## Viewing and Downloading Artifacts in the UI

- Open a task and switch to the **Artifacts** tab to see all artifacts for that run.
- Files download directly. JSON artifacts can be downloaded as *native JSON* or as *CSV* (a list-of-objects structure is automatically converted with headers).
- Browse all runs for a cache under **Project → Artifact Caches**.

## Upload API Reference

**File upload — multipart/form-data**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string (required) | Artifact display name (e.g. `report.tar.gz`). |
| `file` | file (required) | The file to upload. Content-Type is detected automatically. |

**JSON upload — application/json body**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string (required) | Artifact display name (e.g. `results.json`). |
| `data` | any JSON (required) | The JSON value to store. A top-level array of objects enables CSV export. |

:::warning Token scope
The artifact token is scoped to a single run. It cannot be used to read or write artifacts from other runs or other caches. The token expires with the run's retention period.
:::
