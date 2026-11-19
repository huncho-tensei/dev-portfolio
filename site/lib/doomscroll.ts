// The newsstand's headlines: Hawi's "AI doom scroll" takes, read from the Ink and Pixel blog feed.

import type { Headline } from "@/scene/index";

const FEED = "https://inkandpixel.co/blog/feed.xml";
const CATEGORY = "AI doom scroll";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Turns `&amp;`, `&#39;` and friends back into the characters they stand for. */
function decode(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? whole;
    const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : whole;
  });
}

/** The text inside the first `<tag>` of an item, with CDATA unwrapped and entities decoded. */
function field(item: string, tag: string): string {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  if (!match) return "";
  const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return (cdata ? cdata[1] : decode(match[1])).trim();
}

/** Reads the blog's RSS and keeps the doom scroll takes, newest first. Never throws. */
export function parseFeed(xml: string): Headline[] {
  const found: { headline: Headline; when: number }[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    if (field(item, "category") !== CATEGORY) continue;
    const title = field(item, "title");
    const href = field(item, "link");
    const when = Date.parse(field(item, "pubDate"));
    if (!title || !href.startsWith("https://") || Number.isNaN(when)) continue;
    const day = new Date(when);
    found.push({ when, headline: { title, href, date: `${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]}` } });
  }
  return found.sort((a, b) => b.when - a.when).map((f) => f.headline);
}

/** Every take, newest first, refreshed about hourly. An empty list if the blog cannot be read. */
export async function getHeadlines(): Promise<Headline[]> {
  try {
    const response = await fetch(FEED, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
    if (!response.ok) return [];
    return parseFeed(await response.text());
  } catch {
    return [];
  }
}
