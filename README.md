# Ace TMUA website

This folder is the complete, standalone public website for Ace TMUA. It can be
copied into the root of a separate GitHub repository without copying any of the
React Native application, lesson data or practice-question bank.

## Contents

- `index.html` — marketing and early-access page
- `privacy.html` — public privacy policy
- `support.html` — public support page
- `css/` — website styling
- `js/` — early-access form behaviour
- `assets/` — website branding and screenshots
- `waitlist-backend/` — the Google Apps Script source and setup notes
- `.nojekyll` — tells GitHub Pages to serve the static files directly

The early-access form is already connected to the deployed Google Apps Script
endpoint in `js/waitlist.js`. No Google password or spreadsheet edit link is
stored in this repository.

## Before changing domains

The canonical and social-sharing URLs currently use:

`https://finnonthemoon.github.io/ace-tmua/`

Once the new repository or custom domain is live, replace that address in:

- `index.html`
- `privacy.html`
- `support.html`

If using a custom domain, also add the domain in the new repository's GitHub
Pages settings. GitHub will create or update the `CNAME` file.

## Test locally

From inside this folder, start any static web server and open `index.html`
through that server. Test all three pages and submit one disposable email
address to confirm the waitlist connection.
