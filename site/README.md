# Hawi Oyugi — Portfolio

Personal developer portfolio. Next.js 16 (App Router) · Tailwind v4 · Motion · markdown-driven.

**Aesthetic:** warm brutalist editorial — deep warm-charcoal canvas, Kenyan-sun clay accent, ochre secondary. Fraunces display / Hanken Grotesk body / JetBrains Mono tags.

## Develop

```bash
npm run dev      # local dev at http://localhost:3000
npm run build    # production build (statically generates every project page)
npm test         # unit tests for the content layer
npm run lint
```

## Content is markdown-driven

Projects live **one level up**, in `../projects/<slug>/<slug>.md`. The site reads them
at build time (`lib/projects.ts`), so **adding a project = dropping a new `.md` file**
with frontmatter:

```yaml
---
title: my-project
slug: my-project
tagline: One-line description shown on the card and detail header
status: shipped        # shipped | live | open-source | active  (controls badge + ordering)
featured: true         # featured projects get the large spotlight cards on the home page
order: 1               # tiebreaker within a status group
year: "2026"
domain: Security Tooling
stack: [TypeScript, Node.js]
links:                 # any subset — rendered as buttons in priority order
  live: https://...
  github: https://...
  npm: https://...
  pr: https://...
  oss: https://...
diagram: agency        # optional — renders a built-in diagram component
screenshot: true       # optional — reserves a screenshot slot
---

# Title (stripped on render)

## Links (stripped on render — use frontmatter instead)

## The Problem
...
```

Ordering on the home page: **shipped → live → open-source → active**, then by `order`.

## Assets to drop in (currently placeholders)

| Asset | Where | Used by |
|-------|-------|---------|
| Portrait photo | `public/portrait.jpg` | About section (swap the `HO` placeholder in `components/About.tsx`) |
| CV | `public/cv.pdf` | "CV" button in the nav |
| Screenshots | `public/shots/<slug>.png` | projects with `screenshot: true` (swap `components/ScreenshotSlot.tsx`) |

## Contact form

The form posts to a server action (`lib/contact.ts`) that emails via [Resend].
Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (see `.env.example`). Without them the
form validates input and shows a graceful fallback pointing to GitHub/LinkedIn —
the email address is never exposed.

[Resend]: https://resend.com
