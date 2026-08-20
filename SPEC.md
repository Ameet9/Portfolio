# Senior Engineer Lab — Technical Specification

## 1. Functional Requirements

### 1.1 Portfolio Application (apps/portfolio/)
- Developer profile page with bio, skills, experience summary
- Projects showcase with filtering by technology, category, maturity level
- Technology knowledge graph — interactive visualization
- Architecture diagrams viewer (Mermaid/D2 rendered)
- System design case studies browser
- ADR browser and viewer
- Engineering notes explorer (linked to notebook)
- Interview preparation notes viewer
- GitHub repositories integration
- Resume/CV page
- Contact page
- Dark/light theme
- Responsive design (mobile, tablet, desktop)
- Search across all content
- SEO optimization

### 1.2 Engineering Notebook Application (apps/notebook/)
- Organized by technology category (JavaScript, TypeScript, React, Vue, Python, FastAPI, databases, security, API design, system design, distributed systems, cloud, Docker, Terraform, DevOps, observability, performance, testing, AI)
- Each topic follows a 21-section template: What is it?, Why does it exist?, How does it work?, Real-world analogy, Real-world example, Production example, Minimal implementation, Production implementation, Failure scenarios, Debugging, Performance, Security, Alternatives, Trade-offs, Senior-level thinking, Interview questions, Follow-up questions, Strong answer, Common mistakes, Practical exercise, System-design connection
- Code syntax highlighting
- Runnable code examples where applicable
- Navigation by category and topic
- Search within notes
- Progress tracking per topic

### 1.3 Flagship Projects (projects/)
List all 10 projects with their requirements:

**Project 1 — Enterprise SaaS Platform**
- Stack: React + TypeScript + Python/FastAPI + PostgreSQL/Supabase + Redis
- Auth, RBAC, dashboard, CRUD, search, filtering, pagination, audit logs, notifications, file uploads, background jobs, testing, CI/CD

**Project 2 — Real-Time Collaboration Platform**
- Stack: React + TypeScript + FastAPI + WebSockets + Redis + PostgreSQL
- Real-time presence, rooms, messaging, notifications, optimistic UI, reconnection, rate limiting, concurrent users

**Project 3 — E-Commerce / Marketplace**
- Stack: React + TypeScript + Python + PostgreSQL + Redis + GCP
- Catalog, search, cart, inventory, orders, admin, RBAC, payment abstraction, events, notifications, caching

**Project 4 — Distributed Job Processing System**
- Job creation, queues, workers, retries, exponential backoff, dead-letter queue, scheduling, idempotency, job status, monitoring

**Project 5 — Analytics Platform**
- Stack: React + TypeScript + Python + PostgreSQL + MongoDB
- Event collection, dashboards, aggregation, filtering, reports, background processing

**Project 6 — AI Engineering Knowledge Platform**
- Stack: React + TypeScript + Python/FastAPI + PostgreSQL/pgvector + LLM provider
- Document ingestion, RAG, citations, authorization, evaluation, feedback, observability, cost tracking

**Project 7 — AI Software Engineering Agent**
- Requirement analysis, architecture proposal, repository analysis, documentation search, issue analysis, test-plan generation, code-review assistance, tool calling, human approval

**Project 8 — Multi-Tenant SaaS**
- Organizations, users, roles, tenant isolation, feature flags, API keys, audit logs, usage limits, billing abstraction

**Project 9 — Cloud-Native Production System**
- Docker, Cloud Run, PostgreSQL, Redis, Pub/Sub, Cloud Storage, Secret Manager, IAM, CI/CD, Terraform, observability, autoscaling

**Project 10 — System Design Playground**
- Interactive system-design case studies (URL shortener, WhatsApp, YouTube, Instagram, Uber, Netflix, notification system, payment system, file storage, rate limiter, distributed cache, job queue, search engine, AI chat system)
- Each case study: Requirements, Functional/Non-functional requirements, Capacity estimation, API design, Data model, Architecture, Scaling, Bottlenecks, Failure scenarios, Security, Cost, Trade-offs, Alternative architectures, Final decision

### 1.4 Interview Notes (docs/interview/)
- Organized by: JavaScript, TypeScript, React, Vue, Python, FastAPI, PostgreSQL, MongoDB, Redis, Supabase, Firebase, APIs, Security, GCP, Docker, CI/CD, DevOps, System Design, Distributed Systems, Testing, Observability, Performance, AI, LLMs, RAG, Agents, MCP, Behavioral/Leadership
- Each topic: Fundamentals, Important Questions, Senior Questions, Follow-Ups, Strong Answer, Weak Answer, Real-World Example, Trade-Offs, Interview Traps, System Design Connection, Practical Experience
- Interview Preparation Checklist tracking progress

### 1.5 ADR System (docs/adr/)
- Format: Context, Problem, Options, Decision, Alternatives Rejected, Consequences, Risks, Future Migration Path
- Required ADRs: PostgreSQL vs MongoDB, Redis vs no cache, Cloud Run vs Kubernetes, REST vs GraphQL, monolith vs microservices, synchronous vs asynchronous, RAG vs fine-tuning, and more as they arise

### 1.6 Internal Engineering Agents (agents/)
- Architect, Developer, Code Review, Test, Security, Performance, Documentation, Learning, DevOps, AI Evaluation
- Each has defined scope, permissions, safety boundaries
- No autonomous production deployment, no database deletion, no secret exposure

## 2. Non-Functional Requirements

### 2.1 Performance
- Portfolio: < 3s initial load, < 100ms navigation, Core Web Vitals passing
- API: < 200ms p95 latency for standard endpoints
- Every advanced project has PERFORMANCE.md with before/after optimization data

### 2.2 Security
- OWASP Top 10 awareness and mitigation
- JWT with refresh token rotation
- RBAC/ABAC where applicable
- Input validation on all endpoints
- CORS, CSRF, rate limiting
- Secret management via environment variables / Secret Manager
- SECURITY.md in every project
- Agent safety: permission boundaries, tool allowlists, human approval, audit logs, sandboxing

### 2.3 Reliability
- Error boundaries in frontend
- Graceful degradation
- Retry with exponential backoff + jitter
- Circuit breakers where applicable
- Health checks
- Structured error responses

### 2.4 Observability
- Structured logging (JSON)
- Request/correlation IDs
- Metrics collection
- Distributed tracing (OpenTelemetry)
- Error tracking
- GCP Monitoring + Logging integration

### 2.5 Scalability
- Stateless services
- Horizontal scaling via Cloud Run autoscaling
- Connection pooling
- Caching (Redis)
- Async processing for heavy tasks

### 2.6 Accessibility
- WCAG 2.1 AA compliance for portfolio
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### 2.7 Testing
- Frontend: unit (Vitest), component (React Testing Library), E2E (Playwright)
- Backend: unit (pytest), integration, API tests
- Test pyramid defined per project
- CI runs all tests

### 2.8 Documentation
- Every project: README, ARCHITECTURE, API, SECURITY, PERFORMANCE, TESTING, DEPLOYMENT, OBSERVABILITY, CHANGELOG
- ADR/ directory for architectural decisions
- Inline code documentation

## 3. Architecture Overview

High-level: Monorepo containing two applications (portfolio, notebook), 10 flagship projects, shared services, infrastructure-as-code, documentation, learning material, and agent configurations.

Frontend: React + TypeScript SPA with React Router, code splitting, lazy loading
Backend: Python + FastAPI with async, Pydantic validation
Database: PostgreSQL (primary), MongoDB (analytics), Redis (cache/queues), Supabase (managed PG + auth for some projects)
Cloud: GCP (Cloud Run, Cloud SQL, etc.)
CI/CD: GitHub Actions
IaC: Terraform + Docker

## 4. API Architecture
- RESTful with proper HTTP semantics
- OpenAPI/Swagger documentation
- Versioned endpoints (URL path versioning)
- Standard error contract: { error: string, code: string, details?: object }
- Pagination: cursor-based for large datasets, offset for simple lists
- Rate limiting on all public endpoints
- Authentication via JWT Bearer tokens

## 5. Database Architecture
- PostgreSQL: primary relational data (users, organizations, orders, jobs, etc.)
- MongoDB: analytics events, flexible document storage
- Redis: caching, sessions, rate limiting, queues, pub/sub
- Supabase: managed PostgreSQL with RLS for projects requiring it
- Firebase: real-time features, mobile-ready auth
- pgvector: vector storage for AI/RAG features

## 6. Security Architecture
- Defense in depth
- Authentication: JWT + refresh tokens, OAuth 2.0, Supabase Auth
- Authorization: RBAC with permission checks at API layer
- Network: VPC, firewall rules, private services
- Secrets: GCP Secret Manager, never in code
- Dependencies: automated vulnerability scanning
- AI: prompt injection prevention, output validation, tool permission boundaries

## 7. Deployment Architecture
- Containerized with Docker
- Deployed to GCP Cloud Run
- Database on Cloud SQL (PostgreSQL)
- Redis on Memorystore or containerized
- Terraform for infrastructure provisioning
- GitHub Actions for CI/CD
- Blue/green or canary deployments
- Rollback capability

## 8. Integration Points
- GitHub API for repository data
- LLM provider APIs (for AI projects)
- GCP services
- Supabase client SDK
- Firebase client SDK
