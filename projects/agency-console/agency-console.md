---
title: Agency Console
slug: agency-console
tagline: A web dashboard to monitor and manage The Agency's many agents
status: active
featured: false
order: 5
year: "2026"
domain: Internal Tooling
stack: [Next.js, TypeScript, Tailwind CSS]
links: {}
---

# Agency Console

Web dashboard for monitoring and managing The Agency's multi-agent ecosystem.

## Links

- **Source:** `~/Desktop/The Agency/agency-console/`

## The Problem

With 13 active agents, shared files spread across several areas, and a growing staff list, there was no visual way to see the health of the whole system at a glance. The staff list is a text file, which is great for the agents but not for a quick human check. I wanted one screen that shows agent status, what each area covers, and the shared state.

:::gloss
A dashboard is a single screen that pulls scattered information into one clear view, like a car's instrument panel for a system that otherwise lives in dozens of files.
:::

## What I Built

A web console that pictures The Agency: the full roster, the grouping by area, what is active or planned, the shared state, and who passes work to whom. It is a quiet local tool for running the workspace.

## Stack

- Next.js
- TypeScript
- Tailwind CSS

## Key Decisions

- **Reads straight from the source files.** The console reads the agent definitions and staff list directly rather than keeping its own copy, so there is one source of truth and it never drifts out of date.
- **Runs locally, nothing to deploy.** This is an internal tool, not a product. It runs on my own machine next to the workspace it watches.

:::gloss
Running locally means it lives only on my computer, not on the public internet. That is the right call for a private tool that just needs to be useful to me.
:::
