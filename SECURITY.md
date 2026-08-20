# Security Policy

## Reporting Vulnerabilities
Please report any security issues by contacting the repository owner directly. Do not open public issues for security vulnerabilities.

## Security Principles
- Defense in depth
- Least privilege
- Fail secure
- Don't trust user input
- Secure by default

## Authentication & Authorization
- JWT with refresh token rotation
- OAuth 2.0 / OpenID Connect where applicable
- RBAC for access control
- API key management
- Service account security

## OWASP Top 10 Mitigation
- **Broken Access Control**: Enforced RBAC and strict authorization checks on all endpoints.
- **Cryptographic Failures**: Use strong encryption algorithms, secure key management, and enforce HTTPS/TLS everywhere.
- **Injection**: Parameterized queries and strict input validation.
- **Insecure Design**: Threat modeling and security-first architecture reviews.
- **Security Misconfiguration**: Infrastructure as Code (IaC) with hardened defaults.
- **Vulnerable and Outdated Components**: Automated dependency scanning and regular updates.
- **Identification and Authentication Failures**: Strong session management, MFA where applicable, and secure password policies.
- **Software and Data Integrity Failures**: CI/CD pipeline integrity, signed commits, and artifact verification.
- **Security Logging and Monitoring Failures**: Comprehensive audit logging and real-time alerting for suspicious activities.
- **Server-Side Request Forgery (SSRF)**: Network isolation, URL validation, and disabled URL fetching where unnecessary.

## Secret Management
- GCP Secret Manager for production
- Environment variables for local development
- `.env` files never committed
- `.gitignore` configured to exclude secrets

## Dependency Security
- Automated vulnerability scanning
- Dependabot / Renovate for updates
- Supply-chain security awareness

## AI Security
- Prompt injection prevention
- Output validation
- Tool permission boundaries
- No autonomous production access
- Audit logging for all AI actions

## Agent Safety
Reference to [AGENTS.md Section 38 rules](AGENTS.md#section-38-global-agent-safety-rules) for safety protocols concerning internal engineering agents.

## Security Checklist
- [ ] Ensure all input is validated and sanitized.
- [ ] Verify parameterized queries are used for all database access.
- [ ] Confirm no secrets are hardcoded or committed to version control.
- [ ] Enforce HTTPS for all external communications.
- [ ] Ensure endpoints are protected by appropriate authentication and authorization checks.
- [ ] Implement least privilege for service accounts and roles.
- [ ] Check dependencies for known vulnerabilities.
- [ ] Implement adequate logging and monitoring for critical flows.
