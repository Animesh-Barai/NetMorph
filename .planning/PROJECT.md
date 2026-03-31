# NetMorph

## What This Is

NetMorph is a local-first programmable MITM proxy platform designed to intercept, modify, and simulate HTTP/HTTPS traffic across browser and system layers. It provides developers with a powerful control layer over the network, enabling seamless API debugging, mocking, and real-time request manipulation.

## Core Value

Eliminate backend dependencies and infrastructure bottlenecks by providing a high-performance, programmable network execution layer directly on the developer's machine.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **HTTP/HTTPS Interception**: Capture and decrypt traffic using MITM architecture.
- [ ] **Programmable Rule Engine**: Execute custom logic for request/response modification with O(1) matching.
- [ ] **API Mocking**: Simulate backend endpoints with controlled latency and status codes.
- [ ] **Developer Dashboard**: A React-based UI for managing rules and visualizing live network logs.
- [ ] **Chrome Extension**: Lightweight browser integration for rule toggling and script injection.
- [ ] **Local-First Storage**: SQLite-backed persistence for rules and configurations.
- [ ] **System-Wide Support**: Intercept traffic from both browsers and standalone applications.

### Out of Scope

- **Cloud Interception**: Direct interception in cloud environments is not the primary focus (local-first priority).
- **No-Code for Non-Developers**: While the UI is user-friendly, the core power lies in programmable rules for engineers.
- **VPN Replacement**: This is a debugging proxy, not a general-purpose VPN.

## Context

NetMorph is positioned as a local-first alternative to tools like Requestly and Charles Proxy, leveraging the engineering efficiency of `mitmproxy` to handle the complexities of TLS and certificate management. It aims to solve the "waiting for backend" problem in frontend development and the "reproducing production bugs" problem in QA.

## Constraints

- **Performance**: Rule lookup must be O(1); response modification latency < 50ms.
- **Tech Stack**: Python (mitmproxy, FastAPI), React, TypeScript, SQLite, Docker (Locked).
- **Security**: Local-only execution; no external API calls for sensitive traffic data.
- **Architecture**: Modular design (Proxy, Rule Engine, Backend, UI, Extension) to stay AI-maintainable.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Python + mitmproxy | Solves 80% of engineering complexity (TLS/HTTPS) out of the box. | — Pending |
| FastAPI | Provides async performance and native integration with the Python proxy engine. | — Pending |
| React + TS | Industry standard for complex dashboard UIs with dynamic rule builders. | — Pending |
| Dockerized Engine | Ensures environmental reproducibility across different dev machines. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
