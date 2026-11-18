# hawioyugi.com: "the block". Design

Date: 2026-11-19. Status: approved by Hawi on 2026-11-19. Nothing here is built in `site/` yet.

The look, the motion and every behaviour below were agreed by building a throwaway example over more than a dozen rounds. That example lives in `spike-block/` (run `python3 -m http.server 8767` inside it) and is the visual reference for this document. Where this text and the example disagree, the example is right, unless the text says "change".

## 1. Why

Hawi is not looking for a job. The site sits on his LinkedIn and in his X bio, so the visitor is someone curious about him. It should feel made by a person with taste, show what he can build now, and send people on to Ink and Pixel, his writing, or a conversation with him.

The old site was a developer portfolio from before Ink and Pixel. All of it goes: the old projects, the Twende mentions, the CV button, the "hiring" line and the contact form.

## 2. Goals, non-goals, anti-goals

**Goals**

- One page that is itself a piece of work: a small pixel world you scroll through.
- Every kind of work Hawi does is a thing on the block that can be pointed at and opened.
- What can be opened is real: a live page, a playable game, a real article.
- Works on a phone with a thumb as well as on a desktop with a mouse.
- Hawi can change any wording without touching the scene code.

**Non-goals**

- No project case-study pages, no blog on this site, no contact form.
- No "ink" drawing mode, no scoreboard, no shots during the block, no index of cards. All were tried or discussed and dropped.

**Anti-goals** (would make it a failure even if it works)

- Reading like a CV or a job application.
- Naming a client who has not agreed to be named.
- Claims that cannot be clicked through to something real where a link exists.
- The page being unusable or blank for someone on Safari, on a phone, or with motion turned off.

## 3. Constraints

- The live site is a Next.js 16 app in `site/`, deployed on Hawi's Vercel project `dev-portfolio` (root directory `site`), with hawioyugi.com attached. The repository is public.
- Next.js 16 differs from older versions. `site/AGENTS.md` says to read the guides in `node_modules/next/dist/docs/` before writing code. Follow that.
- Only these names may appear: Ink and Pixel, its public products (Maison, Quintal, Croqui, Mirador, Socials Agent) and 7series, all already public on inkandpixel.co. Other clients stay unnamed until Hawi and Mihir decide.
- Ink and Pixel is described as "Co-founded". Its building opens https://inkandpixel.co. Every systems link goes to https://inkandpixel.co/systems.
- No em dashes in any text on the site.
- The example was only ever tested in Chrome and in an emulated phone. Safari and a real phone are untested.

## 4. Approaches considered

1. **Rebuild it inside the existing Next.js site (chosen).** Keeps the domain, the Vercel project and the repository as they are. The server can read the blog feed, serve a text version for search engines, and set the page title and share picture. Costs a proper rebuild of the example's code.
2. **Ship the example's files as they are.** Fastest, but it is one experimental 1,700-line file with no text for search engines or screen readers, the headlines would be a frozen snapshot, and it would mean replacing the Next.js project.
3. **Start a new project.** No advantage over 1, and the domain and hosting would need moving.

Hawi left the technical choices to me, so 1 is my call. Reason: it is the only one that gives live headlines and a readable page behind the picture without changing his hosting.

## 5. What the visitor gets

### 5.1 Opening

The page loads on a small slab of basketball court on a cream page, drawn in chunky pixels. A tall, dark-skinned man with a mini afro, red jersey, black shorts and white shoes takes one jump shot. It goes in. On the make, the name "Hawi Oyugi" and the line under it appear. He holds his follow-through, the ball skips away across the key in three shrinking bounces and rolls, he jogs to it, bends, picks it up with both hands, dribbles back to his spot and faces the visitor. From then on he dribbles, and crosses over by himself every few bounces and whenever the court is clicked.

If the page is loaded part-way down, the shot is skipped and the name shows at once.

### 5.2 The block

Scrolling pulls the camera back steadily. A lawn, a path and paving grow out around the court, and things pop up in this order, each with a big title and one line bottom left:

| Order | Thing | Stands for |
|---|---|---|
| 1 | Five small robots walking the path, two with speech bubbles | Agents and bots |
| 2 | A purple arcade with blinking bulbs and two cabinets | Games |
| 3 | A workshop with turning gears and a smoking chimney | Systems |
| 4 | A cinema with a tiny film on its screen and reels on the roof | Films |
| 5 | A green newsstand with an amber ticker | Writing (the AI doom scroll) |
| 6 | A street of seven shopfronts with striped awnings | Websites |
| 7 | A tall dark building with a pink ink drop breaking into pixels on its roof | Ink and Pixel |

Trees, lamps and benches fill in along the way. The last title of the block is the summary line.

### 5.3 Player cards

Pointing at a thing (mouse) shows its card beside it, joined by a pixel line. Clicking a thing with one destination opens it in a new tab. Clicking a thing with several destinations locks its card open so one can be picked. Escape, the card's X, or clicking empty ground closes a locked card.

A card has: a colour band with the kind of work, a clear picture of the real page where one exists, a name where one is allowed, one line that types itself out, optional rows, tags, and a button. The paper and the band are dithered, a sheen sweeps once when the card appears, and the picture itself is left clean. Only the basketball card has the serial strip along the bottom.

| Thing | Rows | Where it goes |
|---|---|---|
| Workshop | Maison, Quintal, Croqui, Mirador, Socials Agent. Hovering a row swaps the picture to that system. | Every row and the button open inkandpixel.co/systems |
| Arcade | Lifetree, Murim Life, "One on Roblox" | The two browser games open; the Roblox row has no link yet |
| Newsstand | The three newest doom scroll headlines with dates | Each opens its article; the button opens the doom scroll page |
| Ink and Pixel | none | inkandpixel.co |
| Shopfront 2 (7series) | none | inkandpixel.co/seven-series |
| Other shopfronts, cinema, robots, the player | none | Card only |

Cards taller than the space show a pixel scroll rail and a bouncing-basketball "more" tab until the bottom is reached. The band and the X stay fixed while the rest scrolls.

### 5.4 The closing and the chat

Past the finished block the camera comes back in on the court, set to one side, under the title "Next". He takes one more shot. This one hits the front of the rim. The ball flies off the rim into a chat panel that slides in, and lands as its first bubble, "Ask me anything." He puts his hands on his head, lets them fall, shakes his head and turns to face the visitor.

The chat lists seven questions as pixel bubbles. Tapping one shows three dots, then types the answer in a red bubble with his pixel face beside it. One answer is open at a time. The footer links to LinkedIn, X and Ink and Pixel.

"the block" at the top of the chat (or Escape) closes it: "Ask me anything" turns back into the ball, he catches it and dribbles, and the camera pulls out to the whole block, where every thing can be pointed at again. A red "Ask me" tab with his face then sits in the corner. Using it brings the camera back in and he shoots and misses again, into the chat. This loops. Scrolling back up resets everything.

### 5.5 Phones

- A tapped thing makes the camera push in until the thing fills the top of the screen, and its card hangs directly under it. The X, a second tap on the same thing, or scrolling away closes it. Tapping another thing switches to it.
- The chat is a sheet over the lower part of the screen with the court above it. The "Ask me" tab sits top right.
- Anything a finger has to hit is about 40 to 44 pixels tall. The page says "Tap" where it says "Click" on desktop.
- On a phone turned sideways the desktop layout is used, with cards and the chat fitted to the short height.

## 6. Words

All wording lives in one content file so it can be changed without touching the scene. The wording is exactly what the example shows (`spike-block/main.js`: `STAGES`, `SHOPS`, `ROBOTS`, `QA`, `GUY_CARD` and the card data on each thing). Hawi approved all of it on 2026-11-19.

## 7. How it is built

These are my calls, not things Hawi was asked about.

- **One page.** `site/app/page.tsx` renders the text version on the server and mounts the scene on top of it in the browser. All other routes, the project markdown files, the contact code and the Resend dependency are removed.
- **The scene** is plain three.js, loaded only in the browser. The example's single file is split into parts with one job each: the pixel drawing pass, the court and the player, his movement (dribble, shot, rebound, pickup, miss), the block and its things, the camera, the cards, the chat, the scroll cues. The example's test hooks and backup files do not come across.
- **Content** (`titles, card data, questions, links`) is one typed data file. The scene reads it; nothing in the scene holds a sentence.
- **Doom scroll headlines** are read on the server from `https://inkandpixel.co/blog/feed.xml` (items in the category "AI doom scroll"), refreshed about hourly. If the feed cannot be read, the last good list is used, and if there has never been one the newsstand shows only its button.
- **Pictures** on cards are static files in `site/public/`, retaken from the live pages at build-time size, not hot-linked.
- **Fonts** (Pixelify Sans, IBM Plex Mono) are self-hosted through Next.js, not loaded from another site.
- **Text version.** The same titles, lines, card contents, questions and answers are ordinary HTML on the page, so search engines and screen readers get all of it. It is what shows if the scene cannot start.
- **Keyboard.** Every thing with a card is reachable with Tab through a hidden list of buttons that opens the same card. Links in cards and the chat are real links.
- **Reduced motion.** With the system setting on, the shots are skipped, things appear without the bounce, the ball does not fly and answers do not type.
- **Page details.** A real title and description, a share picture of the finished block, and a pixel basketball icon.
- **The example stays out of the repository.** `spike-block/`, `spike-dribble/` and `spike-shotchart/` are reference only and are not committed. They are added to `.gitignore`.
- **Tests.** Small tests for the feed reading and the content file. The scene is checked by looking at it, with a screenshot script kept in the repository.

## 8. What is left to the builder

How the scene parts are named and wired, how the text version is laid out visually behind or beside the scene, the exact refresh interval for the feed, picture sizes and formats, and how the hidden keyboard list is ordered.

## 9. Before it goes live

1. It goes to a Vercel preview link first, never straight to hawioyugi.com.
2. Hawi checks the preview on a real phone and in Safari. Anything found is fixed before production.
3. Hawi says go. Then it replaces the old site.

## 10. Decided by Hawi on 2026-11-19

1. The wording is approved as it stands in the example.
2. "All of this in six months" stays as the summary title.
3. No other clients are named. The shopfronts other than 7series stay unnamed.
4. The Roblox row stays as it is, with no link.
5. Page title "Hawi Oyugi". Description "I like to build things. Co-founder of Ink and Pixel." (my wording, his to change).
