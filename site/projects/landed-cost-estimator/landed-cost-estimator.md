---
title: Landed Cost Estimator
slug: landed-cost-estimator
tagline: Turns a fragile import cost spreadsheet into a guided quote with an animated cost breakdown
status: live
featured: true
order: 3
year: "2026"
domain: Logistics · SaaS
stack: [Next.js, TypeScript, Supabase, Vitest, Playwright, Vercel]
links: {}
shots:
  - landed-cost-estimator-1.jpg
  - landed-cost-estimator-2.jpg
---

# Landed Cost Estimator

A web tool that works out the true cost of landing imported goods, from a guided questionnaire to an animated breakdown of every hidden fee.

## Links

Built from a real import business, so the business, its rates, and the live URL are removed here. This is my own build work, described in the general.

## The Problem

An importer's real cost is never the sticker price. By the time goods land they have picked up duty, VAT, currency swings, port fees, shipping, and inland transport, and most small importers track all of that in one fragile spreadsheet that only its author understands. One wrong cell and a shipment that looked profitable is not. I took a working version of that spreadsheet and turned it into a tool anyone on the team can use without fear of breaking it.

:::gloss
Landed cost is what a product actually costs once it reaches your door, not just what you paid the supplier. It is the number that decides whether an import is worth doing, and it is easy to get wrong by leaving a fee out.
:::

## What I Built

A guided flow that takes a shipment from a few questions to a clear, defensible number.

1. **Guided questionnaire.** Walks the user through the shipment step by step instead of dropping them into a grid of cells, so there is no way to miss a field that changes the answer.

2. **Server computed cost.** The landed cost is worked out on the server: duty, VAT, live currency conversion across several currencies, port fees, shipping, and inland transport. The formula and the rates live in one authoritative place, not scattered across a spreadsheet.

3. **The reveal.** The result is not a static table. Totals count up, a waterfall breaks the price into its parts, callouts surface the hidden fees and the VAT most people forget, and a savings line shows what the tool caught. The user can save the quote or export it to PDF, and a methodology page explains every number.

4. **Accounts and admin.** Magic link sign in with saved quote history, plus an admin panel with a classification queue and editors for the currency and duty rates, so the numbers stay current without touching code.

:::gloss
A waterfall is a chart that starts at one number and shows each fee stacking on top until it reaches the final total, so you can see exactly where the cost comes from rather than just the end figure.
:::

## Stack

- Next.js and TypeScript
- Supabase for the database, auth, and saved quotes
- Vitest and Playwright, with 50 unit tests and 4 end to end tests covering the full guest flow
- Vercel, deploying automatically

## Key Decisions

- **Compute on the server, never the client.** The whole point is a number you can trust, so the calculation and the rates run server side where they cannot be edited from a browser. The client only ever asks for the answer, it never does the maths.

:::gloss
Doing the maths on the server means the real formula stays on a machine the user cannot see or change, so two people entering the same shipment always get the same trustworthy answer.
:::

- **Full tool first, then one big moment.** I built the entire path end to end before polishing, then spent the polish on a single reveal that makes the value obvious in a few seconds. The hidden fee and savings callouts are the hook, and they only work because the numbers underneath them are already right.

- **Tested like it handles money, because it does.** 50 unit tests on the calculation and 4 end to end tests on the guest journey, because a landed cost tool that is occasionally wrong is worse than no tool at all.
