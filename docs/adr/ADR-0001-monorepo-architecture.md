# ADR-0001: Monorepo Architecture

## Date

2026-08-20

## Status

Accepted

## Context

We are building a Senior Software Engineer Portfolio & Engineering Learning Laboratory that includes:
- 2 frontend applications (portfolio, notebook)
- 10 flagship projects
- Shared services (API, worker, AI)
- Infrastructure as code
- Documentation and learning material
- Internal engineering agents

We need to decide whether to use a monorepo or multi-repo approach.

## Problem

How should we organize the codebase across multiple applications, projects, services, infrastructure, documentation, and learning material?

## Options

### Option 1: Monorepo (Single Repository)

All code, documentation, infrastructure, and learning material in one repository.

**Pros:**
- Unified version control and history
- Easier cross-project refactoring
- Shared tooling configuration (linting, formatting, CI)
- Single source of truth for all documentation
- Easier dependency management between shared code
- Simpler onboarding — clone once, see everything
- Atomic commits across multiple components
- Portfolio visitors can explore the entire codebase

**Cons:**
- Repository size grows over time
- CI/CD complexity increases
- Potential for slower clone times
- Need careful directory structure

### Option 2: Multi-Repo (Separate Repositories)

Each project, app, and service in its own repository.

**Pros:**
- Independent version control per project
- Smaller individual repositories
- Independent CI/CD pipelines
- Team isolation (less relevant for solo project)

**Cons:**
- Cross-project changes require multiple PRs
- Harder to maintain consistency across repos
- More complex dependency management
- Portfolio visitors must navigate multiple repos
- Duplicated tooling configuration
- Harder to maintain shared documentation

### Option 3: Hybrid (Core monorepo + satellite repos)

Main monorepo for portfolio, notebook, docs, learning. Separate repos for large flagship projects.

**Pros:**
- Balance of organization and independence
- Large projects can evolve independently

**Cons:**
- Complexity of managing both approaches
- Still requires cross-repo coordination
- Inconsistent developer experience

## Decision

**Option 1: Monorepo**

## Alternatives Rejected

- **Multi-repo**: Too much overhead for a solo engineering project. Cross-referencing between projects, documentation, and learning material is a core feature — this is much harder across repos.
- **Hybrid**: Unnecessary complexity. The benefits of satellite repos don't outweigh the coordination costs for a single developer.

## Consequences

- All code lives in `senior-engineer-lab/` (currently `Portfolio/`)
- Directory structure must be well-organized (see Section 39 of master prompt)
- CI/CD must support selective builds (only rebuild changed components)
- `.gitignore` must be comprehensive
- May need path-based CI triggers to avoid rebuilding everything on every commit

## Risks

- Repository could become very large over time
- Need discipline to keep the directory structure clean
- CI times may increase without path-based filtering

## Future Migration Path

If any project grows significantly, it can be extracted into its own repository. The monorepo structure with clear boundaries makes extraction straightforward.
