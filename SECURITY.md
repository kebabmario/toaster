# Security policy

## Supported versions

Only the version live at [usetoaster.app](https://usetoaster.app), built from the `main` branch, receives security fixes.

## Reporting a vulnerability

Do not report security problems in public issues, pull requests, or discussions.

Report them privately in one of these ways:

- [Open a private security advisory](https://github.com/kebabmario/toaster/security/advisories/new) on GitHub (preferred)
- Email support@usetoaster.app

Include:

- What the problem is and what an attacker could do with it
- Steps to reproduce it, or a proof of concept
- The browser and operating system you used

## What to expect

- We confirm we received your report within 3 days.
- We tell you whether we accept the report, and our plan, within 10 days.
- We credit you in the fix and the changelog, unless you ask us not to.

## Scope

Toaster is a static site with no server and no user accounts. Relevant reports include:

- Cross-site scripting or script injection on usetoaster.app
- Problems in the published build
- Toaster leaking data beyond what the [README](README.md#how-it-works) describes

Out of scope:

- Problems in the third-party services Toaster calls (Cloudflare, ipify, ipwho.is, ipapi.co). Report those to the service.
- Inaccurate speed results. Open a [bug report](https://github.com/kebabmario/toaster/issues/new?template=bug_report.md) instead.
