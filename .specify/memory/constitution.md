# Project Constitution

This document defines the coding standards, architectural principles, and quality expectations for this project. All agents read this before starting work.

---

## Core Principles

- **Clean code over clever code** — prioritize readability and maintainability
- **Test before merging** — no code ships without passing tests
- **Match existing patterns** — consistency beats innovation
- **Security by default** — validate inputs, no secrets in code, encrypt sensitive data
- **Performance matters** — profile before optimizing, but don't ignore obvious bottlenecks

---

## Coding Standards

### Language & Syntax

**JavaScript/TypeScript:**
- Use ES6+ syntax (arrow functions, const/let, destructuring)
- Async/await preferred over .then() chains
- No var declarations
- Semicolons required
- 2-space indentation

### Naming Conventions

- **Variables/functions**: camelCase (JavaScript/TypeScript),
- **Classes/types**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Private members**: prefix with underscore (_privateName)
- **Abbreviations**: avoid (use userId not uid, isActive not isA)

### File Organization

- Group related functionality in directories by feature, not by file type
- Keep files under 300 lines (split large files)
- One class/component per file (with exceptions for small related utilities)
- Tests colocate with source (test.js next to source.js, or __tests__/ folder)

### Comments

- Only comment **why**, never **what** — code should be self-explanatory
- Document public APIs with docstrings
- Flag technical debt with `TODO` or `FIXME` (but not as permanent solutions)
- No commented-out code — use git history instead

---

## Architecture Patterns

### Database

- Use transactions for multi-step operations
- Validate constraints at the database level, not just application
- Never trust user input — sanitize and validate
- Document schema changes in migrations
- Avoid N+1 queries — use joins or batch loading
- Index on foreign keys and frequently-queried columns

### Authentication & Authorization

- All passwords hashed (bcrypt or better)
- Sessions/tokens expire after reasonable timeout
- Refresh tokens separate from access tokens
- No credentials in environment files or logs
- Implement rate limiting on auth endpoints
- Log failed auth attempts (without storing passwords)

### Error Handling

- Catch specific errors, not generic `Exception`
- Return meaningful error messages to clients (no stack traces)
- Log errors with full context for debugging
- Use custom error types/classes for domain errors
- Graceful degradation when external services fail

---

## Testing Strategy

### Coverage Requirements

- **Unit tests**: All public functions, happy path + error cases
- **Integration tests**: Database interactions, API endpoints, external service calls
- **Edge case tests**: Boundary conditions, null/undefined, empty inputs, max values
- **Regression tests**: Any bug that's fixed gets a test to prevent recurrence
- **Performance tests**: For critical paths (if applicable)

Target: **70% code coverage minimum**, focus on meaningful tests not coverage percentage

### Test Structure

**Unit Tests:**
```
describe('functionName', () => {
  describe('with valid inputs', () => {
    it('should [expected behavior]', () => { ... })
  })
  describe('with invalid inputs', () => {
    it('should throw [error type]', () => { ... })
  })
})
```

### Test Framework

[Specify your testing framework and conventions]

**JavaScript/TypeScript:**
- Framework: Vitest

## Performance & Scalability

### Database Queries

- **Acceptable**: < 100ms for typical queries
- **Watch**: 100-500ms queries need review
- **Optimize**: > 500ms queries must have an index or be rewritten
- Use EXPLAIN/ANALYZE before deploying queries

### API Responses

- **Acceptable**: < 200ms p95 response time
- **Critical paths**: < 100ms p95
- Cache aggressively where appropriate (but document invalidation strategy)
- Compress responses (gzip)

### Memory & CPU

- No memory leaks (test with profiler before shipping)
- Avoid blocking operations on main thread / event loop
- Use connection pooling for databases
- Implement backpressure for streams

### Monitoring

- Log request/response times for all API calls
- Alert on error rates > 1%
- Track database connection pool usage
- Monitor memory usage on servers

---

## Security Checklist

### Input Validation

- ✅ Validate all user inputs (type, length, format)
- ✅ Sanitize before storing in database
- ✅ Escape before rendering in HTML/templates
- ✅ Reject unexpected fields in request bodies

### Authentication

- ✅ Require strong passwords (min 12 chars, complexity)
- ✅ Hash passwords with bcrypt (or Argon2)
- ✅ Implement account lockout after failed attempts
- ✅ Require MFA for admin accounts (if applicable)

### Authorization

- ✅ Check permissions on every request
- ✅ Use role-based access control (RBAC) or attribute-based (ABAC)
- ✅ Don't rely on client-side authorization
- ✅ Audit sensitive actions (who did what when)

### Data Protection

- ✅ Encrypt sensitive data at rest (PII, payment info, secrets)
- ✅ Use HTTPS/TLS in transit
- ✅ Never log passwords, tokens, or PII
- ✅ Implement data retention policies (delete old data)
- ✅ Anonymize data in backups and logs

### Dependencies

- ✅ Keep dependencies up to date
- ✅ Run security scanning tools (npm audit, pip audit, Snyk)
- ✅ Review changelogs before updating major versions
- ✅ Remove unused dependencies

---

## Deployment & DevOps

### Code Review

- All code goes through peer review before merging
- Reviewer checks: security, performance, test coverage, style, architecture
- Author responds to feedback before merge
- CI/CD must pass before merging (linter, tests, security scan)

### Environment Variables

- Never commit secrets to version control
- Use `.env.example` with placeholder values
- Document what each env var does and acceptable values
- Rotate secrets regularly

### Versioning

- Semantic versioning: MAJOR.MINOR.PATCH
- MAJOR: breaking changes
- MINOR: new features (backward compatible)
- PATCH: bug fixes
- Document breaking changes in CHANGELOG

### Rollback Strategy

- Keep previous version deployable
- Database migrations must be reversible
- Feature flags for gradual rollout
- Monitor error rates post-deployment

---

## Code Review Criteria

Reviewers should check:

1. **Correctness** — does it do what it's supposed to do?
2. **Tests** — is behavior covered by tests?
3. **Style** — does it follow this constitution?
4. **Security** — are there injection vectors, exposed secrets, missing validation?
5. **Performance** — are there N+1 queries, blocking calls, memory leaks?
6. **Maintainability** — could someone unfamiliar understand this code?
7. **Documentation** — are public APIs documented?

---

## Tools & Linting

### Pre-commit Hooks

Install pre-commit hooks to run linter + tests before committing:

```bash
[Setup instructions for your project]
```

---

## Architecture Decision Records (ADRs)

When making significant architectural decisions:

1. Document the decision in `.specify/adrs/` with title and date
2. Include: context, decision, consequences, alternatives considered
3. Link to relevant code or test files
4. Reference in code comments where the decision affects implementation

Example: `.specify/adrs/001-use-postgres-for-persistence.md`

---

## Common Patterns in This Project

### Error Handling Pattern

[Show an example of how errors should be structured/handled in your codebase]

### Logging Pattern

[Show an example of how to log appropriately]

### API Request Pattern

[Show an example REST/GraphQL request structure]

### Database Query Pattern

[Show an example query and any helper patterns you use]

---

## What's Non-Negotiable

- No code without tests
- No secrets in code
- No SQL injection / XSS vulnerabilities
- No N+1 database queries
- All linting errors must pass
- Code review approval required before merge
- Performance regressions must be justified

---

## When to Escalate

Ask for clarification if:

- A feature request conflicts with this constitution
- You discover a security vulnerability
- Performance metrics exceed thresholds
- A dependency has a critical CVE
- The architecture needs fundamental changes

---

*Last updated: [date] | Owner: [team/person] | Reviewed by: [team/person]*
