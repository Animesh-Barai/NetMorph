# Requirements: NetMorph

**Defined:** 2026-03-31
**Core Value:** Provide a programmable network control layer that eliminates dependency on backend APIs with near-zero latency.

## v1 Requirements

Requirements for the initial release focused on a functional MITM proxy with basic programmable rule execution.

### Proxy Engine (PROX)

- [ ] **PROX-01**: Intercept system-wide HTTP traffic via mitmproxy.
- [ ] **PROX-02**: Intercept system-wide HTTPS traffic via CA certificate trust.
- [ ] **PROX-03**: Display "Certificate Status" to indicate if interception is active.
- [ ] **PROX-04**: Support for non-blocking asynchronous request/response processing.

### Rule Engine (RULE)

- [ ] **RULE-01**: Match requests based on exact URL with O(1) performance.
- [ ] **RULE-02**: Match requests based on URL patterns (contains/regex).
- [ ] **RULE-03**: Execute "Redirect" action to change target URL.
- [ ] **RULE-04**: Execute "Modify Header" action for requests and responses.
- [ ] **RULE-05**: Support for Python-based custom programmable logic hooks.

### Mock Server (MOCK)

- [ ] **MOCK-01**: Return static JSON mock responses for specified endpoints.
- [ ] **MOCK-02**: Support for custom HTTP status codes (404, 500, etc.).
- [ ] **MOCK-03**: Support for simulated network latency (delay in ms).

### Dashboard UI (DASH)

- [ ] **DASH-01**: View live network traffic logs intercepted by the proxy.
- [ ] **DASH-02**: Create, Edit, and Delete rules through a visual interface.
- [ ] **DASH-03**: Enable/Disable rules globally or individually.
- [ ] **DASH-04**: Real-time log filtering by URL, method, or status.

### Persistence & Sync (DATA)

- [ ] **DATA-01**: Store rules and config in a local SQLite database.
- [ ] **DATA-02**: Sync rules to in-memory Redis cache for high-speed matching.
- [ ] **DATA-03**: Export/Import rules in JSON format.

## v2 Requirements

Deferred to future release.

### Extension (EXTN)

- **EXTN-01**: Toggle NetMorph rules directly from a browser popup.
- **EXTN-02**: Inject custom JS/CSS scripts into specific pages.

### API Client (CLNT)

- **CLNT-01**: Send and replay REST requests (Postman-style).
- **CLNT-02**: Save request collections in the local dashboard.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user Auth | Initial focus is local-first developer individual usage. |
| Automatic VPN setup | Focus is API debugging; generic VPN is a different product category. |
| Mobile Proxying | Higher complexity with certificate pinning; defer for now. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROX-01 | Phase 1 | Pending |
| PROX-02 | Phase 1 | Pending |
| PROX-03 | Phase 1 | Pending |
| PROX-04 | Phase 1 | Pending |
| RULE-01 | Phase 2 | Pending |
| RULE-02 | Phase 2 | Pending |
| RULE-03 | Phase 2 | Pending |
| RULE-04 | Phase 2 | Pending |
| RULE-05 | Phase 2 | Pending |
| MOCK-01 | Phase 2 | Pending |
| MOCK-02 | Phase 2 | Pending |
| MOCK-03 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
