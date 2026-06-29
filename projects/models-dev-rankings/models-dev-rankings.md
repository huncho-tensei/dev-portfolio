---
title: models.dev Rankings
slug: models-dev-rankings
tagline: Objective, sortable ranking columns contributed to the open source models.dev catalog
status: open-source
featured: false
order: 3
year: "2026"
domain: Open Source
stack: [TypeScript, Bun, Hono JSX, TanStack Virtual, Zod]
links:
  pr: https://github.com/anomalyco/models.dev/pull/1892
  issue: https://github.com/anomalyco/models.dev/issues/1893
  fork: https://github.com/huncho-tensei/models.dev-PR
shots:
  - models-dev-rankings-1.png
  - models-dev-rankings-2.png
---

# models.dev Rankings

Objective, sortable model ranking columns contributed to models.dev, the open catalog of AI models used inside opencode.

## Links

- **PR:** [anomalyco/models.dev#1892](https://github.com/anomalyco/models.dev/pull/1892)
- **Issue (rationale):** [anomalyco/models.dev#1893](https://github.com/anomalyco/models.dev/issues/1893)
- **Fork:** https://github.com/huncho-tensei/models.dev-PR

## The Problem

models.dev is the most complete open catalog of AI model specs, but it only lets you sort one column at a time, so there is no way to rank the whole catalog by what actually matters to you. Picking a model means eyeballing 25 columns across thousands of rows. This change adds clear, combined scores so you can order every model by the thing you care about.

:::gloss
A catalog here is just a big public table of AI models and their specs. opencode is a popular open source coding tool, so a feature it relies on is used by a lot of developers.
:::

## What I Built

Three sortable score columns added to the existing table, each computed in the open, plus a rank number that renumbers itself as you re sort.

1. **Scoring engine (`score.ts`).** Works out four scores from 0 to 100 using only the facts already in the catalog:
   - **capability**: whether the model can call tools, reason, and return structured answers, plus how many input and output types it handles
   - **cost**: blended price per million tokens, flipped so cheaper ranks higher (free goes top, unknown sits neutral at 50)
   - **context**: how much text the model can take in and give back
   - **recency**: how recently it was released

   Each score is stretched onto the same 0 to 100 range across the whole dataset, so a missing fact lands at a neutral 50 instead of quietly winning or losing.

:::gloss
Putting every score on the same 0 to 100 range is called normalising. Without it you would be comparing prices in dollars against dates against word counts, which is apples to oranges. Normalising makes them fairly addable.
:::

2. **Three ranking lenses.** The same four scores, blended with different weights, all kept in one documented `WEIGHTS` object:

   | Lens | capability | cost | context | recency |
   |---|---|---|---|---|
   | Overall | 0.40 | 0.30 | 0.20 | 0.10 |
   | Value | 0.35 | 0.50 | 0.10 | 0.05 |
   | Capability | 0.60 | 0.15 | 0.20 | 0.05 |

3. **Table integration.** Wired into the site's existing setup so the score columns sort like any other column, defaulting to Overall, highest first. The fiddly part was keeping the table's column counting in step so nothing shifted out of line.

:::gloss
The lenses are just three saved recipes for what "best" means. Value weights price heavily, Capability weights raw power, Overall sits in between. You pick the lens that fits your job.
:::

## Stack

- TypeScript
- Bun for running, building, and checking the code
- Hono JSX to render the page on the server
- TanStack Virtual to keep a huge table fast
- Zod for the existing data checks

:::gloss
A virtualised table only draws the rows you can actually see and recycles them as you scroll, so thousands of rows stay smooth instead of freezing the page.
:::

## Key Decisions

- **Sortable columns, not one decreed ranking.** Any single "best model" number is an opinion. Three lenses (Overall, Value, Capability) keep the data neutral and let the reader choose the one that fits their job.
- **Only objective inputs.** Scores come purely from facts already in the catalog. No benchmarks, no hand grading. The weights sit in one place so anyone can audit or tune them.
- **Named the limitation honestly.** The catalog has no quality score, so this measures specs per dollar, not how smart a model is. I said so plainly in the PR rather than hiding it, which is why cheap all rounders top the list, exactly as the inputs imply.
- **Touches only the display.** The scoring lives entirely in the web layer, so the shared data file the rest of the world relies on stays untouched and neutral.
