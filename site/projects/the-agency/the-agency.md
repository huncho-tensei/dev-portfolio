---
title: The Agency
slug: the-agency
tagline: A personal AI agent ecosystem of 13 specialists under one command structure
status: active
featured: false
order: 4
year: "2026"
domain: AI Systems
stack: [Claude Code Agents, Opus 4.7, Sonnet 4.6, MCP, Flat file state]
diagram: agency
shots:
  - the-agency-1.png
links: {}
---

# The Agency

Personal AI agent ecosystem. 13 active specialist agents run through a single workspace.

## Links

- **Workspace:** `~/Desktop/The Agency/`

## The Problem

Running a full life across university, the job hunt, an international trade business, and personal projects means jumping between completely different worlds dozens of times a day. No single AI assistant can hold real depth across all of them at once. I needed specialists, but specialists that share notes, follow the same patterns, and answer to one chain of command, so I never have to wonder who to ask.

:::gloss
An agent is an AI assistant set up for one specific job, with its own instructions and memory. Think of it as hiring a focused expert instead of asking one generalist to do everything.
:::

## What I Built

A workspace of 13 active agents across five areas of my life, all running on Claude Code.

**Running the agency**

- **Atlas** (the fast model) is the director. It routes tasks, designs new agents, and keeps the staff list current. It hands the heavy thinking to **Atlas Deep** (the powerful model).

:::gloss
The fast model and the powerful model are two versions of Claude. The fast one is quick and cheap for routing and simple jobs, the powerful one is slower but better at hard reasoning. Using each where it fits keeps quality high and cost low.
:::

**Trade operations, between Abidjan and Barcelona**

- **Franklin** is the trade director and the only one I talk to for trade. He passes work to four specialists behind the scenes:
  - **Customs Filing** for import and export paperwork and certificates
  - **Freight Booking** for carrier quotes and shipping instructions on the Abidjan to Barcelona route
  - **Shipment Tracking** for vessel positions, container status, and delays
  - **Trade Route Advisor** for product codes, document checklists, and trade deal savings

**Career**

- **Harvey** runs the Barcelona internship and job hunt. He hands all the writing to **CV Writer** for cover letters, CV tailoring, interview prep, and outreach.

**University**

- **Dissertation Assistant** for academic work: finding sources, structuring arguments, drafting, and citations.
- **Scholar** (early stage) is a coursework partner built for my degree, and the first agent built on a new modular setup that splits personality from skills.

**Life planning**

- **Caesar** plans the long game and the day to day as one connected system, from a ten year vision down to today's tasks.

**Shared wiring.** The agents talk through shared files on disk, a living staff list, and one consistent rule: directors are public facing, specialists stay internal.

:::gloss
Shared files on disk just means the agents read and write plain text files instead of using a database. It needs no setup, I can read it myself, and it is easy to back up and version.
:::

## Stack

- The Claude Code agent system (plain text agent definitions)
- Claude Opus 4.7 for deep reasoning, Claude Sonnet 4.6 for fast routing
- Shared state in plain files, one folder per area
- A modular agent setup, first piloted with Scholar
- MCP servers for GitHub, browser control, and a memory graph

:::gloss
MCP is a standard way to plug outside tools into an AI assistant, like giving it hands to use GitHub or a web browser. It is the difference between an assistant that only talks and one that can actually do things.
:::

## Key Decisions

- **One director per area, specialists hidden behind them.** I talk to one agent per area (Franklin, Harvey, Atlas). That agent quietly delegates to specialists. The interface stays simple while the specialists go deep, so I never have to remember which of 13 agents to call.
- **Plain files over a database.** Agents read and write simple text files for shipments, contracts, benchmarks, and trackers. Nothing to maintain, easy to read, easy to version. The trade off is no safety for two agents writing at once, which is fine for a single user.
- **Power where it counts, speed everywhere else.** Routing agents run on the fast model, deep specialists run on the powerful one, so cost tracks the difficulty of the work.
- **A setup that scales.** The staff list already tracks 17 more planned agents with clear owners, and the structure grows without a rebuild.
