---
title: Concept Studio
slug: concept-studio
tagline: An AI studio that turns an architecture brief into three concept directions, each with numbers, plans, renders, and a client ready deck
status: live
featured: true
order: 1
year: "2026"
domain: AI Product
stack: [Next.js, TypeScript, Supabase, fal.ai Flux, Resend, Vercel]
links: {}
shots:
  - concept-studio-2.jpg
  - concept-studio-1.jpg
  - concept-studio-3.jpg
---

# Concept Studio

An AI platform that turns a written architecture brief into three distinct concept directions, each with its own numbers, floor plans, renders, and a client ready deck.

## Links

Built for a client, so the names, the branding, and the live URL are removed here. This is my own build work, described in the general.

## The Problem

At the concept stage of an architecture project, turning a brief into something a client can look at is days of work for every single direction. Someone works out the numbers, draws a massing and a floor plate, briefs a visualiser, waits for renders, then lays it all into a deck. Because that whole loop is so expensive, most pitches only ever explore one direction, and the client never sees the alternatives that were left on the table.

:::gloss
The concept stage is the very start of a building project, where a firm sells a direction before anything is detailed or built. A massing is the rough shape and size of the building, and a floor plate is the layout of a single floor.
:::

## What I Built

A tool a firm logs into, feeds a brief, and gets three complete concept directions back from, in minutes instead of days.

1. **Brief intake.** A structured form captures the site, the use, the brand, and the hard constraints, so every direction answers the same real brief.

2. **The numbers.** Each concept comes with its own gross floor area, site coverage, plot ratio, storeys, and cost per square metre, worked out from the brief rather than guessed.

3. **Drawings.** A massing study and a ground floor plan for each direction, drawn as the concept's own linework, not a stock template.

4. **Renders with a locked exterior.** A set of visuals per direction, from a rough massing to a sketch to a realistic render to a night atmosphere study, with the building exterior held to the concept's own geometry so every image reads as the same real place instead of a different building each time.

5. **The deck.** Everything lands in a branded, presentation ready deck the firm walks the client through, in the firm's own look, built on the firm's own deck formula.

6. **Accounts and access.** Password and magic link sign in, an owner admin panel, and a request access flow, so the firm controls who gets in.

:::gloss
An image model is an AI that draws a picture from a description. Left alone it will happily invent a different building and a fake backdrop in every shot, so the real work is the guardrails that keep all three directions coherent and tied to the brief.
:::

## Stack

- Next.js and TypeScript
- Supabase for the database, auth, and stored briefs and runs
- fal.ai running Flux for the concept renders
- Resend for the access request emails
- Vercel, deploying automatically

## Key Decisions

- **AI prepares, the firm reviews, the architect decides.** Nothing the tool makes claims to be final. Every output is a draft, watermarked and flagged for review, because the value is a fast, honest starting point for the architect, not a machine pretending to design the building.

- **The numbers and the concept come before the picture.** The model never draws straight from the raw brief. A structured concept step, with the real area, coverage, and plot ratio, sits in between, so the renders answer the brief instead of drifting. This is what separates a usable pitch tool from a novelty image generator.

:::gloss
Locking the exterior means holding the model to the same building geometry every time, so it cannot reinvent the shape between shots. A client at the concept stage is buying a direction and a feeling, backed by real numbers, not a final set of construction drawings.
:::

- **Built around the firm's own rejection rules.** Off the shelf AI tools kept failing the firm's own standards, redesigning the building and inventing backdrops that were not the site. So the firm's deck formula, design standards, and taste rules are encoded into the tool directly, with the team, rather than fought against on every run.

- **Guardrails on spend.** Image generation costs real money per run, so the pipeline is capped and budgeted rather than left open, because a client tool that can quietly burn a budget is not shippable.
