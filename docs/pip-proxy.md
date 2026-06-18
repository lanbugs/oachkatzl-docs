---
id: pip-proxy
title: pip Package Proxy
sidebar_position: 17
---

# pip Package Proxy

By default pip downloads packages from PyPI on every Python task run. A **caching proxy** (devpi or any PEP 503-compatible server) eliminates repeat downloads: packages are fetched once and served locally on all subsequent runs — including runs on other workers.

## How It Works

Set `OACHKATZL_PIP_INDEX_URL` on the worker. Oachkatzl passes it as `--index-url` to every `pip install` invocation. For HTTP-only proxies the required `--trusted-host` flag is added automatically.

:::info Automatic fallback
If the proxy is unreachable or pip exits with an error, Oachkatzl immediately retries the install directly against PyPI. Tasks never fail solely because the proxy is down or temporarily unavailable.
:::

## Docker Compose Setup (Included)

Both `docker-compose.yml` and `docker-compose.hub.yml` include a pre-configured **devpi** service. The worker is already wired to use it — no manual configuration needed for a single-node setup.

| Service / Port | Purpose |
|----------------|---------|
| `devpi` — port `3141` | Caching pip proxy, reachable inside Docker as `http://devpi:3141` and from the host as `http://<host>:3141`. |
| `pip_cache` volume | pip HTTP cache mounted into the worker at `/root/.cache/pip` — speeds up even the proxy-miss case. |

## Distributed / Remote Workers

Workers outside the Docker network set `OACHKATZL_PIP_INDEX_URL` to the external devpi URL. Workers that cannot reach devpi simply leave the variable unset and use PyPI directly.

```bash
# .env on a remote worker — point to the devpi instance on the main host
OACHKATZL_PIP_INDEX_URL=http://10.62.4.5:3141/root/pypi/+simple/
```

## Using a Different Proxy

Any PEP 503-compatible index works — Nexus Repository, Artifactory, pypiserver, etc.:

```bash
# Nexus / Artifactory
OACHKATZL_PIP_INDEX_URL=https://nexus.example.com/repository/pypi-proxy/simple/

# pypiserver (self-hosted, no caching — serves pre-downloaded packages)
OACHKATZL_PIP_INDEX_URL=http://pypiserver.example.com/simple/
```

## Environment Variable Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `OACHKATZL_PIP_INDEX_URL` | *empty* | pip `--index-url`. Empty = PyPI. HTTP URLs get `--trusted-host` added automatically. |
