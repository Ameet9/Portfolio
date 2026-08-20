# ADR-0002: Single Application Architecture

## Date

2026-08-20

## Status

Accepted

## Context

The master prompt (Section 27 and Section 39) describes an Engineering Notebook as a "completely separate application/section." We need to decide whether to build two separate React applications (`apps/portfolio/` and `apps/notebook/`) or a single application with the notebook as a major section.

## Problem

Should the portfolio and engineering notebook be separate React SPAs or a unified application?

## Options

### Option 1: Two Separate Applications

Separate Vite projects in `apps/portfolio/` and `apps/notebook/`.

**Pros:**
- Independent deployment and scaling
- Smaller bundle per app
- Clear separation of concerns

**Cons:**
- Duplicated configuration (Vite, Tailwind, ESLint, tsconfig)
- No shared state or navigation between apps
- Technology graph cannot seamlessly link portfolio → notebook content
- Two deployments to manage
- Users navigate between two different URLs

### Option 2: Single Application with Notebook Section

One React application with the notebook as a major route section (`/learning/*`).

**Pros:**
- Unified navigation and user experience
- Technology graph can link directly to notebook content (e.g., clicking "React" goes to `/learning/react`)
- Shared theme, layout, state
- Single deployment
- Single CI/CD pipeline
- Shared component library
- Better SEO (single sitemap)

**Cons:**
- Larger bundle (mitigated by lazy loading and code splitting)
- Slightly more complex routing

### Option 3: Monorepo with Shared Package

Two apps sharing a component/config package via workspace.

**Pros:**
- Independence with shared code

**Cons:**
- Most complex setup
- Overkill for a solo project

## Decision

**Option 2: Single Application with Notebook Section**

The master prompt uses "application/section" wording, and the portfolio's success criteria (Section 45) explicitly require clicking a technology to show projects, notes, interview prep, and architecture decisions — all on the same platform. A single app with lazy-loaded routes achieves this naturally.

## Alternatives Rejected

- **Two apps**: The core value proposition is a connected engineering knowledge graph. Splitting into two apps fragments this.
- **Shared package monorepo**: Unnecessary complexity for a single-developer project.

## Consequences

- `apps/portfolio/` contains the unified application
- `apps/notebook/` directory remains for any notebook-specific utilities or content processing
- Routes: `/` (home), `/projects/*`, `/learning/*` (notebook), `/interview/*`, `/system-design/*`, `/about`
- Lazy loading per route ensures bundle size stays manageable
- All content is interconnected via the technology graph

## Risks

- Bundle could grow large → mitigated by code splitting, lazy loading, tree shaking
- Notebook content volume could affect build times → mitigated by content stored as data files, not components

## Future Migration Path

If the notebook grows to need independent deployment (e.g., for performance), it can be extracted into a separate app since routes are already self-contained sections.
