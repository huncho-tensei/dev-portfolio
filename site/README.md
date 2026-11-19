# hawioyugi.com

Hawi Oyugi's personal site. One page: a small pixel world you scroll through. He takes a shot, a
neighbourhood builds itself around the court, every building opens something real, and the page
ends in a chat.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Change the words

Every word, link and picture name is in `content/site.ts`. Nothing else needs touching.
The newsstand's headlines are not in that file: they are read from the Ink and Pixel blog
(`lib/doomscroll.ts`), about once an hour.

Card pictures are the JPEGs in `public/cards/`, 504 by 315 pixels, named in the content file.

## Where things are

| Path | What it is |
|---|---|
| `content/site.ts` | All the wording and links |
| `scene/index.js` | The pixel scene: court, player, block, cards, chat. One file, on purpose: it is the example the design was approved on |
| `components/Block.tsx` | The frame the scene lives in |
| `components/TextVersion.tsx` | The same content as plain HTML, for search engines, screen readers, and browsers that cannot draw the scene |
| `lib/doomscroll.ts` | Reads the headlines from the blog feed |
| `app/globals.css` | All the styling |
| `scripts/` | Browser checks |

## Check it

```bash
npm test                 # unit tests: the content file and the feed reader
npm run lint
npm run build
npx next start -p 3210 & # the checks expect the built site here
npm run check            # drives the page in Chrome: opening shot, block, cards, chat, phone, fallback
npm run check -- chat    # only checks with "chat" in the name
```

`BASE=https://some-address npm run check` runs the same checks against a deployed copy.
Add `?debug` to the address to expose the hooks the checks use, and `?noshot` to skip the opening shot.

## Not done yet

- Opening cards from the keyboard alone.
- A calmer version for people who have motion turned off in their system settings.
