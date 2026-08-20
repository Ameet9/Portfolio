# Learning Curriculum

> Structured learning path from fundamentals to senior-level mastery.

## Curriculum Philosophy

- **Depth over breadth** — understand deeply rather than skim many topics
- **Primary stack mastery** — deep expertise in React, TypeScript, Python, FastAPI, PostgreSQL, GCP
- **Adjacent technology understanding** — strong architectural knowledge of complementary technologies
- **Every topic connects** — learning material links to projects, interview notes, ADRs, and system design
- **Progressive complexity** — each phase builds on the previous one

## Knowledge Level Definitions

| Level | Name | Description |
|-------|------|-------------|
| 1 | Awareness | Know it exists and roughly what it does |
| 2 | Beginner | Can follow tutorials, understand basic concepts |
| 3 | Intermediate | Can build features independently, understand trade-offs |
| 4 | Advanced | Can architect solutions, handle edge cases, optimize |
| 5 | Production | Can deploy, monitor, debug in production environments |
| 6 | Senior | Can design systems, mentor others, make architectural decisions |
| 7 | Expert | Deep mastery, can innovate, evaluate cutting-edge approaches |

## Topic Template

Every learning topic follows the **21-section template** (see Engineering Notebook, Section 27 of master prompt):

1. What is it?
2. Why does it exist?
3. How does it work?
4. Real-world analogy
5. Real-world example
6. Production example
7. Minimal implementation
8. Production implementation
9. Failure scenarios
10. Debugging
11. Performance
12. Security
13. Alternatives
14. Trade-offs
15. Senior-level thinking
16. Interview questions
17. Follow-up questions
18. Strong answer
19. Common mistakes
20. Practical exercise
21. System-design connection

---

## Phase 1 — JavaScript Deep Dive

**Target Level:** Advanced → Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Execution Context & Call Stack | High | Senior |
| 2 | Event Loop, Microtasks, Macrotasks | High | Senior |
| 3 | Promises | High | Senior |
| 4 | Async/Await | High | Senior |
| 5 | Closures & Scope | High | Senior |
| 6 | Hoisting | Medium | Advanced |
| 7 | Prototypes & Prototype Chain | High | Senior |
| 8 | `this`, bind, call, apply | High | Senior |
| 9 | Modules (ES Modules, CommonJS) | High | Advanced |
| 10 | Generators & Iterators | Medium | Advanced |
| 11 | Symbols | Medium | Intermediate |
| 12 | WeakMap & WeakSet | Medium | Advanced |
| 13 | Garbage Collection & Memory Leaks | High | Senior |
| 14 | Browser APIs | Medium | Advanced |
| 15 | Concurrency Patterns | High | Senior |
| 16 | Debouncing & Throttling | High | Advanced |

---

## Phase 2 — TypeScript Deep Dive

**Target Level:** Advanced → Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Primitives & Basic Types | High | Advanced |
| 2 | Interfaces vs Type Aliases | High | Advanced |
| 3 | Unions & Intersections | High | Advanced |
| 4 | Generics | High | Senior |
| 5 | Utility Types | High | Senior |
| 6 | Mapped Types | High | Senior |
| 7 | Conditional Types | High | Senior |
| 8 | Template Literal Types | Medium | Advanced |
| 9 | Type Guards & Narrowing | High | Senior |
| 10 | Discriminated Unions | High | Senior |
| 11 | keyof, typeof, infer | High | Senior |
| 12 | Declaration Files & Module Augmentation | Medium | Advanced |
| 13 | Strict Mode | High | Advanced |
| 14 | Runtime Validation (Zod) | High | Senior |
| 15 | API Contract Typing | High | Senior |

---

## Phase 3 — React Advanced Lab

**Target Level:** Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Rendering & Reconciliation | High | Senior |
| 2 | Virtual DOM Concepts | High | Senior |
| 3 | useState & useReducer | High | Senior |
| 4 | useEffect (lifecycle, cleanup, deps) | High | Senior |
| 5 | useMemo & useCallback | High | Senior |
| 6 | useRef | High | Advanced |
| 7 | useContext | High | Advanced |
| 8 | Custom Hooks | High | Senior |
| 9 | State Architecture Patterns | High | Senior |
| 10 | TanStack Query (server state) | High | Senior |
| 11 | Optimistic Updates | High | Senior |
| 12 | Caching Strategies | High | Senior |
| 13 | Error Boundaries | High | Senior |
| 14 | Suspense Concepts | Medium | Advanced |
| 15 | Lazy Loading & Code Splitting | High | Senior |
| 16 | Accessibility (a11y) | High | Senior |
| 17 | Performance Optimization | High | Senior |
| 18 | Virtualization | Medium | Advanced |
| 19 | Web Workers | Medium | Advanced |
| 20 | Frontend Security | High | Senior |

---

## Phase 4 — Vue Advanced Lab

**Target Level:** Advanced → Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Composition API | High | Senior |
| 2 | ref, reactive, computed | High | Senior |
| 3 | watch & watchEffect | High | Advanced |
| 4 | Lifecycle Hooks | High | Advanced |
| 5 | Composables | High | Senior |
| 6 | Pinia State Management | High | Senior |
| 7 | Vue Router | High | Advanced |
| 8 | Reusable Components | High | Senior |
| 9 | Testing (Vitest + Vue Test Utils) | High | Advanced |
| 10 | Performance | Medium | Advanced |
| 11 | React vs Vue Comparison | High | Senior |

---

## Phase 5 — Python + FastAPI

**Target Level:** Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Python Data Structures | High | Advanced |
| 2 | Generators & Iterators | High | Senior |
| 3 | Decorators | High | Senior |
| 4 | Context Managers | High | Senior |
| 5 | Dataclasses & Typing | High | Senior |
| 6 | Async/Await & asyncio | High | Senior |
| 7 | Threading & Multiprocessing | High | Senior |
| 8 | Concurrency Patterns | High | Senior |
| 9 | Profiling & Memory Management | Medium | Advanced |
| 10 | FastAPI Routing & Dependencies | High | Senior |
| 11 | Pydantic Validation | High | Senior |
| 12 | Middleware & Error Handling | High | Senior |
| 13 | Authentication & Authorization | High | Senior |
| 14 | Background Tasks | High | Senior |
| 15 | WebSockets | High | Advanced |
| 16 | OpenAPI & API Versioning | High | Senior |
| 17 | Rate Limiting | High | Advanced |
| 18 | Testing (pytest) | High | Senior |

---

## Phase 6 — Databases

**Target Level:** Senior

### PostgreSQL
| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Schema Design & Normalization | High | Senior |
| 2 | Indexes (B-tree, GIN, GiST, composite) | High | Senior |
| 3 | Transactions & ACID | High | Senior |
| 4 | Isolation Levels & MVCC | High | Senior |
| 5 | Locking & Deadlocks | High | Senior |
| 6 | Query Optimization (EXPLAIN ANALYZE) | High | Senior |
| 7 | Pagination (cursor vs offset) | High | Senior |
| 8 | Partitioning | Medium | Advanced |
| 9 | Replication | Medium | Advanced |
| 10 | Connection Pooling | High | Senior |
| 11 | Migrations (Alembic) | High | Senior |

### MongoDB
| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Document Modeling | High | Advanced |
| 2 | Embedding vs Referencing | High | Advanced |
| 3 | Indexes & Aggregation | High | Advanced |
| 4 | Transactions | Medium | Advanced |
| 5 | When to Choose MongoDB | High | Senior |

### Redis
| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Caching Strategies (aside, through, behind) | High | Senior |
| 2 | TTL & Cache Invalidation | High | Senior |
| 3 | Distributed Locks | High | Senior |
| 4 | Rate Limiting | High | Senior |
| 5 | Pub/Sub & Queues | High | Advanced |
| 6 | Sessions | Medium | Advanced |
| 7 | Failure Scenarios | High | Senior |

### Supabase
| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Auth & RLS | High | Advanced |
| 2 | Storage & Realtime | Medium | Advanced |
| 3 | Edge Functions | Medium | Intermediate |
| 4 | Database Policies | High | Advanced |

### Firebase
| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Authentication | Medium | Intermediate |
| 2 | Firestore & Security Rules | Medium | Intermediate |
| 3 | Cloud Functions | Medium | Intermediate |

---

## Phase 7 — Security

**Target Level:** Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | JWT & Token Management | High | Senior |
| 2 | OAuth 2.0 & OpenID Connect | High | Senior |
| 3 | Sessions vs Tokens | High | Senior |
| 4 | CORS & CSRF | High | Senior |
| 5 | RBAC & ABAC | High | Senior |
| 6 | Password Hashing (Argon2, bcrypt) | High | Advanced |
| 7 | OWASP Top 10 | High | Senior |
| 8 | SQL Injection | High | Senior |
| 9 | XSS | High | Senior |
| 10 | SSRF & IDOR | High | Advanced |
| 11 | Rate Limiting & Abuse Prevention | High | Senior |
| 12 | Audit Logging | High | Senior |
| 13 | Supply-Chain Security | Medium | Advanced |

---

## Phase 8 — Cloud & DevOps

**Target Level:** Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Docker & Multi-stage Builds | High | Senior |
| 2 | Docker Compose | High | Advanced |
| 3 | GCP Cloud Run | High | Senior |
| 4 | GCP Cloud SQL | High | Senior |
| 5 | GCP Cloud Storage | High | Advanced |
| 6 | GCP Pub/Sub | High | Senior |
| 7 | GCP Secret Manager | High | Advanced |
| 8 | GCP IAM & Service Accounts | High | Senior |
| 9 | GCP Networking (VPC, Load Balancer, CDN) | Medium | Advanced |
| 10 | GCP Monitoring & Logging | High | Senior |
| 11 | Terraform | High | Senior |
| 12 | GitHub Actions CI/CD | High | Senior |
| 13 | Blue/Green & Canary Deployments | Medium | Advanced |
| 14 | Kubernetes Concepts | Medium | Awareness |
| 15 | Linux & Networking Fundamentals | Medium | Advanced |

---

## Phase 9 — System Design

**Target Level:** Senior → Expert

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Scalability & Availability | High | Senior |
| 2 | CAP & PACELC | High | Senior |
| 3 | Load Balancing | High | Senior |
| 4 | Caching Architectures | High | Senior |
| 5 | Replication & Sharding | High | Senior |
| 6 | Consistency Models | High | Senior |
| 7 | Distributed Locks & Idempotency | High | Senior |
| 8 | Circuit Breakers & Bulkheads | High | Senior |
| 9 | Sagas & Distributed Transactions | High | Senior |
| 10 | Architecture Patterns (Monolith, Microservices, Serverless) | High | Senior |
| 11 | Event-Driven Architecture | High | Senior |
| 12 | CQRS & Event Sourcing | Medium | Advanced |
| 13 | API Gateway & BFF | Medium | Advanced |
| 14 | Message Queues vs Event Streaming | High | Senior |

---

## Phase 10 — Production Engineering

**Target Level:** Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Structured Logging | High | Senior |
| 2 | Metrics & Dashboards | High | Senior |
| 3 | Distributed Tracing (OpenTelemetry) | High | Senior |
| 4 | SLI, SLO, SLA, Error Budgets | High | Senior |
| 5 | Incident Response | High | Senior |
| 6 | Frontend Performance (Core Web Vitals) | High | Senior |
| 7 | Backend Performance (latency, throughput) | High | Senior |
| 8 | Load Testing | Medium | Advanced |
| 9 | Failure Testing & Chaos Engineering Concepts | Medium | Advanced |

---

## Phase 11 — AI Engineering

**Target Level:** Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | LLM Fundamentals (tokens, context, temperature) | High | Senior |
| 2 | Embeddings & Vector Databases | High | Senior |
| 3 | Semantic Search & Hybrid Search | High | Senior |
| 4 | RAG Architecture | High | Senior |
| 5 | Reranking | High | Advanced |
| 6 | Prompt Engineering | High | Senior |
| 7 | Structured Outputs | High | Senior |
| 8 | Tool Calling | High | Senior |
| 9 | Model Selection & Cost | High | Senior |
| 10 | Hallucination & Grounding | High | Senior |
| 11 | AI Security (prompt injection, data leakage) | High | Senior |
| 12 | AI Evaluation Metrics | High | Senior |

---

## Phase 12 — Agentic AI

**Target Level:** Advanced → Senior

| # | Topic | Priority | Target Level |
|---|-------|----------|-------------|
| 1 | Agent Architecture & Planning | High | Senior |
| 2 | Tool Calling & MCP | High | Senior |
| 3 | Agent State & Memory | High | Senior |
| 4 | Workflows & Human-in-the-Loop | High | Senior |
| 5 | Retries & Failure Recovery | High | Advanced |
| 6 | Guardrails & Permissions | High | Senior |
| 7 | Observability for AI | High | Senior |
| 8 | Agent Evaluation | High | Senior |

---

## Additional Technologies (Awareness → Intermediate)

These are adjacent technologies that a senior engineer should understand architecturally, even without deep hands-on expertise.

| Technology | Target Level | Phase |
|-----------|-------------|-------|
| GraphQL | Intermediate | 5 |
| gRPC | Awareness | 5 |
| Kafka Concepts | Intermediate | 9 |
| RabbitMQ Concepts | Intermediate | 9 |
| Nginx / Reverse Proxies | Intermediate | 8 |
| DNS / HTTP / HTTPS / TLS | Advanced | 8 |
| Kubernetes Concepts | Awareness | 8 |
| Prometheus Concepts | Intermediate | 10 |
| Grafana Concepts | Intermediate | 10 |
| SRE / Reliability Engineering | Advanced | 10 |

---

## Project-to-Phase Mapping

| Project | Primary Phase | Technologies Demonstrated |
|---------|--------------|--------------------------|
| Enterprise SaaS | 3, 5, 6, 7 | React, FastAPI, PostgreSQL, Redis, Auth, RBAC |
| Real-Time Collaboration | 3, 5, 6 | React, FastAPI, WebSockets, Redis, PostgreSQL |
| E-Commerce / Marketplace | 3, 5, 6, 9 | React, Python, PostgreSQL, Redis, GCP, Transactions |
| Distributed Job Processing | 5, 6, 9, 10 | Python, Redis, PostgreSQL, Queues, Observability |
| Analytics Platform | 3, 5, 6 | React, Python, PostgreSQL, MongoDB, Aggregation |
| AI Knowledge Platform | 3, 5, 6, 11 | React, FastAPI, PostgreSQL/pgvector, LLMs, RAG |
| AI Engineering Agent | 5, 11, 12 | Python, FastAPI, Agents, MCP, Tools, Memory |
| Multi-Tenant SaaS | 3, 5, 6, 7 | React, FastAPI, PostgreSQL, RBAC, Tenant Isolation |
| Cloud-Native Production | 8, 10, 16 | Docker, Cloud Run, Terraform, Observability, CI/CD |
| System Design Playground | 9 | Architecture, Capacity, Trade-offs |
