## Description

<!-- Briefly describe the change. What does it do? Why is it needed? -->

## Type of change

- [ ] Feature
- [ ] Fix / Bug
- [ ] Chore / Refactor
- [ ] Security
- [ ] Documentation

## Preview

Every PR gets an automatic preview deployment:
- The **Preview verify** workflow builds, deploys, and runs verification against the preview
- The preview URL and verification verdict are posted as a **comment on this PR** once complete
- **This check must pass before merge** — it is a required status check on `main`

To re-run the preview manually:
```bash
gh workflow run "Preview verify (PR)" --ref <branch-name>
```

## Verification

- [ ] `npx next build` passes locally
- [ ] Route smoke-tested (critical paths return 200)
- [ ] Preview URL verified (see automated comment below)

## Related

<!-- Link any related issues, PRs, or cards. Closes/Fixes/Refs #xxx -->