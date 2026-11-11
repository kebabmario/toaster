<p align="center">
  <img src="app/icon.svg" alt="Toaster logo" width="88" height="88" />
</p>

<h1 align="center">Toaster</h1>

<p align="center">
  A fast, minimal internet speed test that runs entirely in your browser.
  <br />
  <a href="https://usetoaster.app"><strong>Run a test</strong></a>
  ·
  <a href="https://docs.usetoaster.app">Documentation</a>
  ·
  <a href="https://github.com/kebabmario/toaster/issues/new?template=bug_report.md">Report a bug</a>
  ·
  <a href="https://github.com/kebabmario/toaster/issues/new?template=feature_request.md">Request a feature</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-ffd23f" alt="MIT license" /></a>
  <a href="https://github.com/kebabmario/toaster/actions/workflows/deploy.yml"><img src="https://github.com/kebabmario/toaster/actions/workflows/deploy.yml/badge.svg" alt="Deploy status" /></a>
</p>

## About

Toaster measures your connection the moment the page opens. There is nothing to install and no account to make. Results can be a little off compared to dedicated tools, since everything runs in the browser.

It measures:

- **Download speed**, shown live as the test runs
- **Latency**, with the connection idle
- **Latency under load**, which shows bufferbloat
- **Upload speed**
- **Connection details**: your public IP, provider, the Cloudflare edge you reached, and approximate location

## How it works

Speed and latency come from [Cloudflare's speed test endpoints](https://speed.cloudflare.com/). Toaster downloads and uploads test data for a few seconds and averages the fastest samples, so a slow first request does not drag the result down.

Connection details come from these services:

| Data | Source |
| --- | --- |
| Public IP | [ipify](https://www.ipify.org/) |
| Provider and location | [ipwho.is](https://ipwho.is/), with [ipapi.co](https://ipapi.co/) as a fallback |
| Cloudflare edge | Cloudflare `/meta` |

> [!NOTE]
> Your browser contacts these services directly, so each one sees your IP address. Toaster has no server and stores nothing.

## Development

Toaster is built with [Next.js](https://nextjs.org/) and React, and exported as static files.

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/kebabmario/toaster.git
cd toaster
npm install
npm run dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts a local server with hot reload |
| `npm test` | Runs the unit tests |
| `npm run build` | Builds the static site into `out/` |

### Project structure

```
app/
  SpeedTest.jsx     The page: readout, speed trace, results
  globals.css       All styles and the color palette
  icon.svg          Logo and favicon
  layout.js         Fonts and page metadata
lib/
  speedtest.mjs     Measurement logic, no UI
public/             Static files copied as is
legacy/             The previous plain HTML version
```

### Deployment

Every push to `main` builds the site and publishes it to GitHub Pages through [the deploy workflow](.github/workflows/deploy.yml). In the repository settings, Pages must use **GitHub Actions** as its source.

## Contributing

Contributions are welcome. Read the [contributing guide](CONTRIBUTING.md) to get started, and follow the [code of conduct](CODE_OF_CONDUCT.md).

To report a security problem, follow the [security policy](SECURITY.md). Do not open a public issue.

## Developers

- [@kebabmario](https://github.com/kebabmario)
- [@tacwreck](https://github.com/tacwreck)

![Repobeats analytics](https://repobeats.axiom.co/api/embed/0a9e089823503d17f4e9dcf17db235433bfb926d.svg "Repobeats analytics image")

## Other projects

Check out [atmos](https://useatmos.me/), a simple, lightweight weather website.

## License

Toaster is released under the [MIT License](LICENSE).
