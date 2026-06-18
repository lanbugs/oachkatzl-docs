---
id: build-deploy
title: Build & Deploy
sidebar_position: 9
---

# Build & Deploy

:::info
Build and Deploy are **template types** (not app types). The underlying execution is the same — what changes is the metadata tracking and the deploy→build relationship.
:::

## Template Type: Task (Default)

A standard run. No artifact tracking. Use this for ad-hoc automation, maintenance scripts, configuration management, etc.

## Template Type: Build

Use this for templates that **produce an artifact** — a compiled binary, a Docker image, a package, a deployment archive, etc.

- Each successful build task records a **version number** (stored on the task).
- The version is available to downstream deploy templates.
- Your script/playbook is responsible for the actual artifact creation. Oachkatzl tracks *which version was built when*.

**Example build script (Bash):**

```bash
#!/bin/bash
VERSION=$(git describe --tags --abbrev=0)
docker build -t myapp:$VERSION .
docker push myapp:$VERSION
echo "Built version $VERSION"
```

## Template Type: Deploy

Use this to **deploy a specific build version**. A deploy template references a *build template*.

- When starting a deploy task you select which build version to deploy.
- The deploy task stores a reference to the source build task (`build_task`).
- This gives you a clear audit trail: *"Production is running build #42, deployed at 14:32 by alice."*

**Example deploy script (Bash):**

```bash
#!/bin/bash
# $OACHKATZL_BUILD_VERSION is injected from the build task
kubectl set image deployment/myapp myapp=myapp:$OACHKATZL_BUILD_VERSION
kubectl rollout status deployment/myapp
```

## Typical Workflow

1. Create a **Build** template → run it → artifact is created, version recorded.
2. Create a **Deploy** template, referencing the build template.
3. When you run the deploy, select the build version to deploy.
4. Both tasks appear in the task history with their relationship visible.
