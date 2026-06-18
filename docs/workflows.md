---
id: workflows
title: Workflows
sidebar_position: 14
---

# Workflows

A **Workflow** chains multiple task templates into a directed graph. Each node runs one template; edges between nodes define when the next node starts based on the outcome of its predecessor.

## Creating a Workflow

Open a project, navigate to *Workflows* and click **New workflow**. The canvas opens with a **START** node. Hover over any node to reveal the toolbar, then use one of the four buttons to build the graph.

## Node Toolbar Buttons

| Button | What it does |
|--------|-------------|
| ✓ (green) | **Add on success** — creates a new node connected with an *On Success* edge. |
| ✗ (red) | **Add on failure** — creates a new node connected with an *On Failure* edge. |
| → (gray) | **Add always** — creates a new node connected with an *Always* edge. |
| 🔗 (blue) | **Link to existing node** — draws an edge from this node to any node already on the canvas. A dialog lets you choose the target and the condition. Use this to create *AND-joins* (multiple predecessors for one node). |

## Connection Conditions

| Condition | When the next node runs |
|-----------|------------------------|
| ✓ On Success | The predecessor task finished with exit code 0. |
| ✗ On Failure | The predecessor task finished with a non-zero exit code or was stopped. |
| → Always | Regardless of the predecessor's outcome. |

## Canvas Controls

- **Drag** nodes to reposition them — positions are saved with the workflow.
- **Click** a node to open the edit panel below the canvas (change label, template, or delete).
- Hover an edge and click **×** to remove the connection.
- The **Auto-layout** button (top-right of canvas) rearranges all nodes in columns by execution order and fits the viewport.

## AND-Join Semantics

A node with *multiple predecessors* uses AND-join logic: it only starts once **all** predecessors have finished and at least one of their edges fires. If any predecessor votes "no" (its outcome does not match any outgoing edge type), the node is **skipped**.

To create an AND-join, use the **Link** button (🔗) on each source node and point it to the shared target node. For example, to run a cleanup task only when both a "deploy" node and a "smoke-test" node have succeeded, link both to the cleanup node with an *On Success* edge.

## Running a Workflow

Click **Run** on the workflows list. If the workflow has [survey variables](survey-variables), they are collected once before the first node starts and passed to every node. The run view shows a live graph with per-node status badges and links to individual task logs.

## Notifications

Individual task notifications are **suppressed** for tasks that run inside a workflow. A single summary notification is sent when the workflow run reaches a terminal state (*success* or *error*), respecting the *Suppress success alerts* setting on the workflow.

:::tip
Use *On Failure* edges to build error-handling branches — for example, a rollback playbook that only runs when the deploy node fails.
:::
