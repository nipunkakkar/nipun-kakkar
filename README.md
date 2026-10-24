# Nipun Kakkar

Personal website for Nipun Kakkar, AI Engineer and Data Scientist.

**Website:** [nipunkakkar.github.io/nipun-kakkar](https://nipunkakkar.github.io/nipun-kakkar/)

The site presents my career, technical skills, certifications, education, photographs, and contact links. It includes interactive explanations of agent workflows, linear regression, neural networks, and recommendations, plus a downloadable PDF résumé.

## Local preview

Requires Node.js. No dependency installation or build step is needed.

```sh
npm run dev
```

Open `http://127.0.0.1:4173/`. Set the `PORT` environment variable to use another port.

## Project files

- `dist/`: the finished website and the assets used by it.
- `serve.mjs`: local preview server.
- `scripts/check-site.mjs`: checks for the interactive examples, local assets, and résumé download.
- `.github/workflows/deploy-pages.yml`: publishes `dist` directly to GitHub Pages.

The existing design and page content are preserved. The repository contains the files used by the website; original document sources, unused photographs, local diagnostics, and temporary previews are excluded.

## Verification

```sh
npm run check
npm test
```

The examples use small illustrative datasets or fixed weights and run entirely in the browser. Checks cover regression convergence, neural activations, recommendation ranking, agent workflow branches, and required page assets. No model API, account system, analytics, or data collection is used.

## GitHub Pages

Pages uses **GitHub Actions** as its publishing source. Every push to `main` publishes the existing `dist` directory; the workflow can also be run manually from the Actions tab. It does not rebuild the website or install dependencies.

All local links are relative, so the website works at the `/nipun-kakkar/` project path. Update files inside `dist`, run the checks, commit, and push to publish changes.

Personal photographs and résumé belong to Nipun Kakkar. Certification cards open the issuers' public verification pages. Fonts optionally load from Google Fonts, with system font fallbacks.
