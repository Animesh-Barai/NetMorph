# Stack Research

**Domain:** Programmable Network Proxy & API Debugging
**Researched:** 2026-03-31
**Confidence:** HIGH (Locked by Product Spec)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Python | 3.11+ | Proxy Engine & Backend | Native support for mitmproxy and FastAPI; high performance for networking. |
| mitmproxy | 10.x | HTTPS Interception | Industry standard for MITM; handles TLS, certificates, and traffic routing out of the box. |
| FastAPI | 0.100+ | Control Layer API | Async, type-safe, and extremely fast for rule management and UI sync. |
| React | 18.x | Dashboard UI | Best-in-class for complex state management (rule builders, live logs). |
| TypeScript | 5.x | Frontend & Extension | Ensures type safety across complex network data structures. |
| SQLite | 3.x | Local Storage | Perfect for local-first apps; zero infra overhead; persistent and fast. |
| Docker | 24.x | Containerization | Ensures consistent environment for the mitmproxy engine and backend. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Redis | 7.x | Memory Cache | Real-time rule matching and session state. |
| Clerk | Latest | Authentication | Zero-maintenance auth for production-ready security. |
| Supabase | Latest | Real-time Sync | Storing rules and syncing across devices (optional cloud layer). |
| Tailwind CSS | 3.x | Styling | Rapid, consistent UI development for the dashboard. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| mitmproxy CLI | Debugging proxy hooks | Useful for testing `addon.py` before UI integration. |
| Postman/Insomnia | API Testing | Testing the FastAPI control layer. |
| Chrome DevTools | Extension debugging | Mandatory for the browser interception layer. |

## Installation

```bash
# Backend (Python)
pip install mitmproxy fastapi uvicorn sqlalchemy redis

# Frontend (React)
npx create-next-app@latest frontend --typescript --tailwind
npm install @clerk/nextjs @supabase/supabase-js

# Extension (TS)
# (Initialize via vite or custom manifest v3 template)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| mitmproxy (Python) | Node Proxy (e.g., hoxy) | If the team only knows JS; however, HTTPS/TLS handling is significantly harder. |
| SQLite | PostgreSQL | If moving to a multi-user, server-side hosted environment. |
| Clerk | Auth0 | If existing enterprise SSO requirements exist. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Custom TLS logic | Extremely high complexity and security risk (20k+ LOC problem). | mitmproxy |
| Plain XHR patching | Limited to browser-only; misses system-wide app traffic. | MITM Proxy architecture |
| Regex-heavy matching | Performance bottleneck for high-frequency traffic. | Hashmap/Trie indexing |

## Sources

- [mitmproxy docs](https://docs.mitmproxy.org) — TLS/HTTPS handling verified.
- [FastAPI docs](https://fastapi.tiangolo.com) — Async performance verified.
- [Requestly Architecture analysis] — Validated proxy + extension hybrid model.

---
*Stack research for: NetMorph*
*Researched: 2026-03-31*
