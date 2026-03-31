# Pitfalls Research

**Domain:** Programmable Network Proxy & API Debugging
**Researched:** 2026-03-31
**Confidence:** HIGH (Locked by Product Spec)

## Critical Pitfalls

### Pitfall 1: Manual Certificate Installation Friction

**What goes wrong:**
Users fail to install the MITM CA certificate correctly, leading to "Connection Not Private" errors for HTTPS sites.

**Why it happens:**
OS-level certificate installation is non-trivial and differs across Windows, macOS, and Linux.

**How to avoid:**
Automate certificate installation where possible and provide a dedicated "Certificate Status" UI with clear, step-by-step guides.

**Warning signs:**
Logs showing repeated TLS handshake failures or "Certificate not trusted" errors.

**Phase to address:**
Phase 1 (Core Proxy Engine).

---

### Pitfall 2: High Latency Rule Matching

**What goes wrong:**
The proxy slows down the entire browsing experience because it's scanning 100+ rules for every single request.

**Why it happens:**
Linear scanning (O(N)) or regex-heavy matching on every request.

**How to avoid:**
Use hashmap-based indexing for exact matches and a Trie or optimized regex engine for pattern matches (O(1) approach).

**Warning signs:**
Response modification latency $> 100$ms in logs.

**Phase to address:**
Phase 2 (Rule Engine).

---

### Pitfall 3: Port Conflicts

**What goes wrong:**
NetMorph fails to start because port 8080 or 8000 is already in use by another dev tool.

**Why it happens:**
Standard ports are common defaults for many tools.

**How to avoid:**
Dynamically detect port availability or allow easy port configuration in the UI/Config.

**Warning signs:**
"Address already in use" errors on startup.

**Phase to address:**
Phase 1 (Core Proxy Engine).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Static Rule List | Faster to implement. | Performance scales poorly with rule count. | Only in the very first prototype. |
| Browser-only Interception | Easier setup (Extension only). | Misses electron apps, mobile simulators, etc. | Never (Core value is system-wide). |
| No Redis caching | Simpler architecture. | Rule changes require full proxy restart. | acceptable in early Phase 1. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| mitmproxy hooks | Blocking the event loop in `request()`/`response()`. | Use `async` hooks and non-blocking I/O. |
| Chrome Extension | Using deprecated Manifest V2. | Use Manifest V3 (Service Workers). |
| Supabase Sync | Over-syncing traffic logs. | Only sync rules; keep traffic logs local-only. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Logging to DB | High write latency. | Use an in-memory buffer for logs; flush periodically. | > 50 requests/sec |
| Rule Regex Overuse | High CPU usage. | Prefer exact host/path matching where possible. | > 20 active rules |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Control API | Remote attackers could modify proxy rules. | Bind Control API to `localhost` ONLY. |
| Storing Plane-text Auth | Credential theft. | Use OS Keychain or encrypted local storage. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| "Silent" Failures | Rules don't apply, user doesn't know why. | Visual indicator in Dashboard when a rule matches a request. |
| Complex JSON Editor | Hard for non-coders to create mocks. | Visual "Rule Builder" with form fields. |

## Sources

- [mitmproxy common issues](https://github.com/mitmproxy/mitmproxy/issues)
- [Requestly support forum](https://github.com/requestly/requestly/issues)
- [Chrome Extension dev guides](https://developer.chrome.com/docs/extensions/mv3/intro/)

---
*Pitfalls research for: NetMorph*
*Researched: 2026-03-31*
