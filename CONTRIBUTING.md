# Contributing Guidelines

## Development Workflow
1. Branch from `main`
2. Follow naming: `feature/`, `bugfix/`, `docs/`, `refactor/`
3. Write tests
4. Update documentation
5. Create PR with description
6. Pass CI checks
7. Code review
8. Merge

## Coding Standards

### TypeScript/JavaScript
- Strict TypeScript
- ESLint + Prettier
- Functional components (React)
- Composition API (Vue)
- Meaningful variable names
- Small, focused functions

### Python
- Type hints everywhere
- `ruff` for linting
- `black` for formatting  
- `mypy` for type checking
- Pydantic for validation
- `async` where appropriate

## Commit Messages
We use Conventional Commits:
- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `refactor`: refactoring
- `test`: adding tests
- `chore`: maintenance
- `perf`: performance
- `security`: security fix

## Pull Request Template

```markdown
## Description
[Describe your changes here]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] My code follows the coding standards
- [ ] I have written tests
- [ ] All tests pass
- [ ] I have updated documentation
- [ ] I have run linters and formatters
```

## Architecture Decisions
Any architectural change requires an ADR (Architecture Decision Record).

## Testing Requirements
- All new features must have tests
- Test pyramid: unit > integration > E2E
- Backend: `pytest`
- Frontend: `Vitest` + React Testing Library + `Playwright`

## Documentation Requirements
- Update `README.md` for new features
- Update `ARCHITECTURE.md` for structural changes
- Create ADR for architectural decisions
- API changes require OpenAPI updates

## Security
- Never commit secrets
- Input validation on all boundaries
- Follow OWASP guidelines
- Review `SECURITY.md`
