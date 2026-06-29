---
title: Uni-Tool
slug: uni-tool
tagline: An EdTech tool that turns assignment briefs into structured, well cited drafts
status: active
featured: false
order: 6
year: "2026"
domain: EdTech SaaS
stack: [Next.js, TypeScript, Tailwind CSS, Jest]
links: {}
---

# Uni-Tool

EdTech SaaS platform for university assignment support: brief decoding, outline generation, and section drafting.

## Links

- **Source:** `~/Desktop/The Agency/uni-tool/`

## The Problem

University students spend more time working out what a brief is asking and how to structure their answer than they do actually writing. The gap between "here is the brief" and "here is a solid first draft" is where most of the time and stress lives, especially for international business students juggling several modules with different citation styles and marking schemes.

## What I Built

A tool that walks a student through the whole assignment, step by step.

1. **Brief Decoder.** Reads an assignment brief and pulls out the task type, the key requirements, the marking criteria, the word count, the citation style, and the deadline.
2. **Outline Generator.** Builds a structured outline from that, with headings, a flow of argument, and suggested places to find sources.
3. **Section Drafter.** Writes draft sections from the outline, with proper citations and a tone matched to what the brief is asking for.

:::gloss
A brief is the instruction sheet a tutor hands out for an assignment. The tool reads it the way a strong student would, spotting the hidden requirements that decide your grade, then turns that into a plan and a first draft.
:::

**Stage one is done.** The core path is built and covered by 88 tests, across the brief decoding and outline steps, over 20 rounds of careful, test first development.

**Stage two is next:** a setup flow for new users and the drafting engine.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Jest, with 88 tests

## Key Decisions

- **Each step is its own piece.** Decode, outline, and draft are separate modules with a clear handover between them, so each can be tested and improved on its own. The decoder knows nothing about drafting, and the drafter just takes an outline.

:::gloss
Building it in separate pieces means I can fix or upgrade one step without touching the others, the way you can swap one appliance in a kitchen without rewiring the whole house.
:::

- **Tests first, from day one.** 88 tests before stage two even begins. The decoder and outline steps are fully covered. This was not optional, because the tool produces academic work, so being correct matters more than being quick to market.

:::gloss
Writing the tests first means I describe what correct looks like before building the feature, then keep working until it passes. It is a safety net that catches mistakes the moment they appear.
:::

- **Born from real use.** Uni-Tool grew straight out of building Scholar, my coursework agent. The patterns that worked there, reading a brief, building a structured outline, drafting with citations, carried directly into a standalone product.

## Status

Stage one is complete. Stage two, the setup flow and the drafting engine, is next.
