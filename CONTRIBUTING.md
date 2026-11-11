# Contributing to Toaster

Thanks for helping improve Toaster. This guide covers how to ask questions, report bugs, suggest features, and send code.

By taking part, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).

## Questions

Read the [documentation](https://docs.usetoaster.app) and search [existing issues](https://github.com/kebabmario/toaster/issues) first. If neither answers your question, open an issue and give as much context as you can.

## Reporting bugs

1. Make sure you are on the latest version at [usetoaster.app](https://usetoaster.app).
2. Search [open bugs](https://github.com/kebabmario/toaster/issues?q=is%3Aissue+label%3Abug) to see if it is already reported.
3. Open a [bug report](https://github.com/kebabmario/toaster/issues/new?template=bug_report.md) and fill in the template.

Speed results vary between runs and between tools. A different number from another speed test is only a bug if it is consistent and large.

Security problems never go in public issues. Follow the [security policy](SECURITY.md).

## Suggesting features

Open a [feature request](https://github.com/kebabmario/toaster/issues/new?template=feature_request.md). Explain the problem it solves, not only the solution. Toaster aims to stay small and fast, so features that help most people have the best chance.

## Contributing code

### Set up

You need Node.js 20 or newer.

```bash
git clone https://github.com/<your-username>/toaster.git
cd toaster
npm install
npm run dev
```

The site runs at http://localhost:3000.

### Make your change

1. Create a branch from `main`, for example `fix/upload-timeout` or `feature/history`.
2. Keep the change focused on one thing.
3. Put measurement logic in `lib/speedtest.mjs` and UI in `app/`.
4. Add or update tests in `lib/` when you change measurement logic.
5. Check that everything passes:

   ```bash
   npm test
   npm run build
   ```

6. Check the page in a browser, on desktop and phone widths.

### Open a pull request

Push your branch and open a pull request against `main`. Fill in the template, link the issue it fixes, and add screenshots for visual changes.

A maintainer reviews it and may ask for changes. Once approved, it is merged and deployed automatically.

## Style

- Plain JavaScript and plain CSS. No TypeScript, CSS frameworks, or new dependencies without discussing it in an issue first.
- Colors live as variables at the top of `app/globals.css`. Reuse them instead of adding new ones.
- Write interface text in plain words and sentence case.

### Commit messages

Write a short summary in the imperative mood, under 72 characters:

```
Fix upload test overrunning on slow connections
```

Add a body after a blank line when the reason for the change is not obvious.

## Licensing

By contributing, you confirm you wrote the work or have the right to submit it, and you agree it is released under the project's [MIT License](LICENSE).
