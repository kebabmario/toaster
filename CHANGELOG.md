# Changelog

All notable changes to Toaster are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-11-11

### Added

- Next.js and React app, hosted on Vercel
- New design: a large live download number, a speed trace line, and the Midnight color palette
- Toaster logo, used as the favicon and in the header
- All results shown at once, without a "Show more info" toggle
- "Run again" button to restart the test
- Unit tests for the measurement helpers
- MIT license, security policy, and issue and pull request templates

### Fixed

- Cloudflare edge showed `[object Object]` after a change in Cloudflare's response
- Download test could run far past 8 seconds on slow connections
- Rate-limited responses counted as near-zero speed samples

### Changed

- The previous plain HTML version moved to `legacy/`

## [1.0.0]

- Plain HTML, CSS, and JavaScript speed test powered by Cloudflare
