# Roadmap: NetMorph

## Overview

NetMorph will be built in a modular fashion, starting with the core network interception engine and moving up to the programmable rule logic, backend persistence, and finally the React dashboard. This ensures the technical hardest part (HTTPS interception) is validated before the UI is built.

## Phases

- [ ] **Phase 1: Foundation & Proxy Engine** - Functional mitmproxy with HTTPS interception capability.
- [ ] **Phase 2: Rule Execution Engine** - O(1) rule matching and basic transformation logic (Redirect, Headers).
- [ ] **Phase 3: Mocking & Logic Hooks** - API Mocking server and support for programmable Python hooks.
- [ ] **Phase 4: Control Layer & Persistence** - FastAPI backend and SQLite/Redis storage for rule management.
- [ ] **Phase 5: Dashboard UI** - React-based visual interface for rules and real-time network logs.

## Phase Details

### Phase 1: Foundation & Proxy Engine
**Goal**: Establish the core MITM interception layer.
**Depends on**: Nothing
**Requirements**: PROX-01, PROX-02, PROX-03
**Success Criteria**:
  1. User can intercept HTTP/HTTPS traffic from the browser.
  2. CA certificate can be generated and trusted on the host machine.
  3. "Certificate Status" is correctly reported by the proxy engine.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Setup mitmproxy environment and certificate management.
- [ ] 01-02: Implement basic interception hooks in `addon.py`.

### Phase 2: Rule Execution Engine
**Goal**: Implement high-performance rule matching and basic mutation logic.
**Depends on**: Phase 1
**Requirements**: RULE-01, RULE-02, RULE-03, RULE-04, DATA-02
**Success Criteria**:
  1. Requests matching an exact URL are identified in O(1) time.
  2. URL Redirection and Header Modification rules are executed correctly.
  3. Rules are matched against an in-memory Redis cache for speed.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Implement the O(1) Matcher and pattern matching logic.
- [ ] 02-02: Implement Redirect and Header modification handlers.

### Phase 3: Mocking & Logic Hooks
**Goal**: Extend the core with API mocking and programmable capabilities.
**Depends on**: Phase 2
**Requirements**: MOCK-01, MOCK-02, MOCK-03, RULE-05, PROX-04
**Success Criteria**:
  1. User can return static JSON mocks for specific API endpoints.
  2. Custom status codes and simulated latency are applied to responses.
  3. Custom Python logic can be executed within a rule hook.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement the Mock Server logic and latency simulation.
- [ ] 03-02: Implement the programmable Python hook execution layer.

### Phase 4: Control Layer & Persistence
**Goal**: Provide a persistent API for managing rules and system state.
**Depends on**: Phase 3
**Requirements**: DATA-01, DATA-03, DASH-02 (Backend)
**Success Criteria**:
  1. Rules are successfully stored in and retrieved from SQLite.
  2. FastAPI exposes endpoints for rule CRUD and Proxy-UI sync.
  3. Rules can be exported/imported as JSON.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Setup SQLite/SQLAlchemy schemas and migrations.
- [ ] 04-02: Implement FastAPI routes and Redis sync tasks.

### Phase 5: Dashboard UI
**Goal**: A modern, real-time interface for controlling NetMorph.
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria**:
  1. User can view live network logs in the dashboard.
  2. User can create/edit rules through a visual interface.
  3. Real-time log filtering and rule toggling are functional.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Initialize React/TypeScript project and core UI layout.
- [ ] 05-02: Integrate real-time logs and rule management features.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Rule Engine | 0/2 | Not started | - |
| 3. Mocking | 0/2 | Not started | - |
| 4. Control Layer | 0/2 | Not started | - |
| 5. Dashboard UI | 0/2 | Not started | - |
