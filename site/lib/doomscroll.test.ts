import { afterEach, describe, expect, it, vi } from "vitest";
import { getHeadlines, parseFeed } from "./doomscroll";

const item = (title: string, link: string, date: string, category: string) =>
  `<item><title>${title}</title><link>${link}</link><guid>${link}</guid><pubDate>${date}</pubDate><category>${category}</category><dc:creator>Someone</dc:creator><description>text</description></item>`;

const FEED = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Blog</title>
${item("Older take", "https://inkandpixel.co/blog/older", "Sat, 03 Oct 2026 08:00:00 GMT", "AI doom scroll")}
${item("A team post", "https://inkandpixel.co/blog/team-post", "Thu, 15 Oct 2026 08:00:00 GMT", "Team Ink and Pixel")}
${item("<![CDATA[Newer take: R&D <fast>]]>", "https://inkandpixel.co/blog/newer", "Tue, 03 Nov 2026 09:00:00 GMT", "AI doom scroll")}
</channel></rss>`;

describe("parseFeed", () => {
  it('keeps only items in the category "AI doom scroll", newest first', () => {
    expect(parseFeed(FEED).map((h) => h.href)).toEqual([
      "https://inkandpixel.co/blog/newer",
      "https://inkandpixel.co/blog/older",
    ]);
  });

  it("formats the date as day and short month", () => {
    expect(parseFeed(FEED)[0].date).toBe("3 Nov");
    expect(parseFeed(FEED)[1].date).toBe("3 Oct");
  });

  it("decodes entities and CDATA in titles", () => {
    const feed = `<rss><channel>${item("Tom &amp; Jerry&#39;s &quot;take&quot;", "https://inkandpixel.co/blog/a", "Tue, 03 Nov 2026 09:00:00 GMT", "AI doom scroll")}</channel></rss>`;
    expect(parseFeed(feed)[0].title).toBe(`Tom & Jerry's "take"`);
    expect(parseFeed(FEED)[0].title).toBe("Newer take: R&D <fast>");
  });

  it("drops an item whose link is not https", () => {
    const feed = `<rss><channel>${item("Bad", "javascript:alert(1)", "Tue, 03 Nov 2026 09:00:00 GMT", "AI doom scroll")}${item("Plain", "http://inkandpixel.co/blog/a", "Tue, 03 Nov 2026 09:00:00 GMT", "AI doom scroll")}</channel></rss>`;
    expect(parseFeed(feed)).toEqual([]);
  });

  it("drops an item with no title or an unreadable date", () => {
    const feed = `<rss><channel>${item("", "https://inkandpixel.co/blog/a", "Tue, 03 Nov 2026 09:00:00 GMT", "AI doom scroll")}${item("No date", "https://inkandpixel.co/blog/b", "sometime", "AI doom scroll")}</channel></rss>`;
    expect(parseFeed(feed)).toEqual([]);
  });

  it("returns [] for an empty string, for HTML, and for truncated XML", () => {
    expect(parseFeed("")).toEqual([]);
    expect(parseFeed("<!doctype html><html><body>404</body></html>")).toEqual([]);
    expect(parseFeed(FEED.slice(0, 180))).toEqual([]);
  });
});

describe("getHeadlines", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns [] when the blog cannot be reached", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("network down")));
    expect(await getHeadlines()).toEqual([]);
  });

  it("returns [] when the blog answers with an error page", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("<html>502</html>", { status: 502 })));
    expect(await getHeadlines()).toEqual([]);
  });

  it("returns at most the three newest takes", async () => {
    const many = [1, 2, 3, 4, 5]
      .map((d) => item(`Take ${d}`, `https://inkandpixel.co/blog/t${d}`, `0${d} Nov 2026 09:00:00 GMT`, "AI doom scroll"))
      .join("");
    vi.stubGlobal("fetch", () => Promise.resolve(new Response(`<rss><channel>${many}</channel></rss>`, { status: 200 })));
    expect((await getHeadlines()).map((h) => h.title)).toEqual(["Take 5", "Take 4", "Take 3"]);
  });
});
