# Architecture Research

**Domain:** Programmable Network Proxy & API Debugging
**Researched:** 2026-03-31
**Confidence:** HIGH (Locked by Product Spec)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Chrome Extension Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │ Rules   │─────>│ Service      │─────>│ Core Engine  │    │
│  │ Manager │      │ Worker       │      │ Injector     │    │
│  └────┬────┘      └──────┬───────┘      └──────┬───────┘    │
│       │                  │                     │            │
├───────┼──────────────────┼─────────────────────┼────────────┤
│       │        React Dashboard UI (Control)    │            │
├───────┼──────────────────┼─────────────────────┼────────────┤
│       │                  │                     │            │
│  ┌────▼────┐      ┌──────▼───────┐      ┌──────▼───────┐    │
│  │ Rule    │<────>│ FastAPI      │<────>│ Database     │    │
│  │ Editor  │      │ Backend      │      │ (SQLite)     │    │
│  └────┬────┘      └──────┬───────┘      └──────────────┘    │
│       │                  │                                  │
├───────┼──────────────────┼──────────────────────────────────┤
│       │        MITM Proxy Engine (Execution)                │
├───────┼──────────────────┼──────────────────────────────────┤
│       │                  │                                  │
│  ┌────▼─────┐      ┌─────▼──────┐      ┌─────────────┐      │
│  │ mitmproxy│<────>│ Rule       │<────>│ Redis       │      │
│  │ Addon    │      │ Engine     │      │ (Cache)     │      │
│  └──────────┘      └────────────┘      └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Proxy Engine** | Intercepts HTTP/HTTPS traffic and executes rule logic. | mitmproxy + Python Addon. |
| **Rule Engine** | Matches incoming requests against active rules (O(1)). | Python hashmap-based matcher. |
| **Backend API** | Manages CRUD operations for rules and syncs with UI. | FastAPI + SQLAlchemy. |
| **Dashboard** | Visual interface for rule creation and log monitoring. | React + TypeScript + Vite. |
| **Extension** | Injects scripts and toggles interception logic in-browser. | Chrome Extension Manifest V3. |
| **Storage** | Persistent storage for rules and local configurations. | SQLite (Local-first). |

## Recommended Project Structure

```
netmorph/
├── proxy/              # mitmproxy logic
│   ├── addon.py        # mitmproxy entry point
│   └── interceptor.py  # Request/Response modification hooks
├── core/               # Shared rule engine logic
│   ├── engine.py       # Rule matching and execution
│   └── matcher.py      # O(1) matching implementation
├── backend/            # FastAPI Control Layer
│   ├── main.py         # API entry point
│   ├── routes/         # Rule management endpoints
│   └── models/         # Database schemas
├── frontend/           # React Dashboard
│   ├── src/            # UI components and logic
│   └── public/         # Static assets
├── extension/          # Chrome Extension
│   ├── background.ts   # Service worker
│   └── content.ts      # Script injection logic
├── infra/              # Deployment and environment
│   └── docker-compose.yml
└── specs/              # System memory and consistency docs
```

## Data Flow

### Request Flow

```
[Target App]
    ↓ (HTTP/S Request)
[mitmproxy Engine] → [Addon Hook] → [Rule Engine] → [Redis Cache]
    ↓                   ↓              ↓              ↓
[Modified Request] ← [Execution] ← [Rule Found] ← [Match Found]
    ↓ (to Internet)
[Target Server]
```

### Rule Creation Flow

```
[React UI] → [FastAPI] → [SQLite]
               ↓           ↓
            [Redis] ← [Sync Task]
               ↓
        [Proxy Engine Memory]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10 users | Local-first; simple SQLite + binary proxy. |
| 10-100 users | Shared Redis instance for rule distribution. |
| 100+ (Teams) | Supabase sync; cloud-hosted proxy clusters. |

## Sources

- [mitmproxy architecture docs](https://docs.mitmproxy.org/stable/concepts-howmitmproxyworks/)
- [Requestly system design analysis]
- [FastAPI production deployment patterns]

---
*Architecture research for: NetMorph*
*Researched: 2026-03-31*
