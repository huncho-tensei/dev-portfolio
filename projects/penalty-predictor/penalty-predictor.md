---
title: penalty-predictor
slug: penalty-predictor
tagline: An interactive 2026 World Cup penalty predictor powered by real research
status: live
featured: true
order: 2
year: "2026"
domain: Product · Data Viz
stack: [Next.js 16, TypeScript, Tailwind CSS, Framer Motion, SVG]
links:
  github: https://github.com/huncho-tensei/penalty-predictor
  live: https://penalty-predictor-ivory.vercel.app
shots:
  - penalty-predictor-1.png
  - penalty-predictor-2.png
  - penalty-predictor-3.png
---

# penalty-predictor

Interactive penalty shootout predictor for the 2026 FIFA World Cup with a research backed probability model and animated simulations.

## Links

- **GitHub:** https://github.com/huncho-tensei/penalty-predictor
- **Live:** https://penalty-predictor-ivory.vercel.app

## The Problem

Penalty stats and prediction models already exist in academic papers and on betting sites, but there is no fun, visual tool that lets fans explore real matchups. With the 2026 World Cup starting, I wanted to build something that pairs real data with an experience people actually enjoy, not just numbers in a table.

## What I Built

A two screen web app where you pick any penalty taker against any goalkeeper from the 48 qualified teams, then simulate penalties using real statistics.

**Screen one, the matchup**

- 48 teams and 145 players (97 takers, 48 keepers), each with team coloured dropdowns
- A Randomise button for quick exploration
- A fight card style preview with flag emojis
- Rotating quotes from World Cup legends (35 of them)

**Screen two, the arena**

- A goal drawn in code, with glowing metal posts, a net mesh, a grass floor, and stadium floodlights
- A honeycomb heat map showing where the taker tends to shoot (teal) laid over where the keeper tends to dive (coral)
- Hot zones that pulse to pull your eye to the high chance areas
- Ball movement that reacts to the shot: top corners rocket straight in with speed lines, low and central shots curve naturally
- A keeper that dives and twists to match the direction
- A net ripple and a glow ring on goals, a gold flash on shots off the post or bar
- A broadcast style result bar that slides in: GOAL, SAVED, or MISSED
- The last five results stacked as fading dots
- Three pressure modes (Regular, Shootout Early, Shootout Decisive) on an animated slider

:::gloss
A heat map shades an area by how often something happens, so hot colours mean a spot the taker favours or the keeper guards. Drawing the goal in code (rather than as a photo) keeps it razor sharp at any size and lets every piece animate.
:::

**Side panels**

- Taker profile: bars for strike rate, this matchup, foot, career penalties, and conversion rate
- Keeper profile: save rate, how they compare to an average keeper, penalties faced
- A "Did you know" fact for 16 verified players, including Kane, Messi, Ronaldo, Mbappé, and Dibu

**The probability model**

- A five step simulation: miss check, taker aim, keeper guess, a same zone save check, then zone difficulty times keeper quality
- Zone save difficulty taken from a PLOS One 2024 study and other published research (top corners are saveable about 8 percent of the time, the low centre about 40 percent)
- Keeper quality set as their real save rate divided by the league average of 0.17
- Pressure modes tuned against ten thousand simulated shots each to match real conversion rates: Regular 82.3 percent, Early 79.3 percent, Decisive 70.2 percent
- A full write up of the model lives in docs/model-analysis.md

:::gloss
Running ten thousand simulated shots is called a Monte Carlo method. You let chance play out thousands of times and read the averages, the same way you would learn a coin is fair by flipping it a thousand times rather than solving it on paper.
:::

## Stack

- Next.js 16 and TypeScript
- Tailwind CSS
- Framer Motion for the animation: ball flight, keeper dive, the pressure slider, and smooth reveals
- Vector graphics drawn in code for the goal, the heat map, the net, and the shot
- A fixed data file of players, teams, research baselines, and quotes
- Vercel, deploying automatically from GitHub

## Key Decisions

I built the probability model from scratch from published research rather than training a machine learning model. The difficulty tables, keeper numbers, and pressure adjustments all trace back to specific studies, and the output matches real world rates to within half a percent, with no training pipeline needed.

:::gloss
Machine learning would mean feeding a computer thousands of past penalties and letting it find patterns on its own. I went the other way and encoded what researchers have already measured, which is more transparent and easy to check.
:::

I chose a fixed data file over a live server because this is a tournament snapshot, not a live feed. All 145 players carry real stats from FBRef and Transfermarkt where available, with research based estimates for the rest. A simple "verified or derived" flag makes that honest and clear to the user.

I also leaned hard into the visual layer, the night game atmosphere, the reactive ball, the broadcast result bar, the team coloured details, because the feel is what makes this a portfolio piece and not just a calculator.

## Stats

- 20 commits
- 145 players across 48 teams
- 35 rotating quotes from World Cup legends
- 16 players with verified facts
- 4,559 possible matchups
- Tested against ten thousand simulated penalties per matchup
- Score probability range: 68.4 percent to 92.0 percent
