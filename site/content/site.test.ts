import { describe, expect, it } from "vitest";
import { site } from "./site";
import type { Card } from "./site";

const cards: Card[] = [site.player, ...site.robots, site.arcade, site.workshop, site.cinema, site.newsstand, ...site.shops, site.studio];

/** Every string anywhere in the content. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

/** Every web address the content can send someone to. */
function links(): string[] {
  const out: string[] = [];
  for (const c of cards) {
    if (c.href) out.push(c.href);
    for (const r of c.rows ?? []) if (r.href) out.push(r.href);
  }
  for (const q of site.chat.questions) {
    if (q.link) out.push(q.link[1]);
    for (const m of q.a.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) out.push(m[1]);
  }
  for (const f of site.chat.footer) out.push(f[1]);
  return out;
}

describe("the site's words", () => {
  it("has ten stages, seven shopfronts, five robots, seven questions", () => {
    expect(site.stages).toHaveLength(10);
    expect(site.shops).toHaveLength(7);
    expect(site.robots).toHaveLength(5);
    expect(site.chat.questions).toHaveLength(7);
  });

  it("uses no em dashes", () => {
    const bad = strings(site).filter((s) => /[–—]/.test(s));
    expect(bad).toEqual([]);
  });

  it("every link is https", () => {
    const all = links();
    expect(all.length).toBeGreaterThan(10);
    expect(all.filter((l) => !l.startsWith("https://"))).toEqual([]);
  });

  it("sends every systems row and the systems button to https://inkandpixel.co/systems", () => {
    const systems = "https://inkandpixel.co/systems";
    expect(site.workshop.href).toBe(systems);
    expect(site.workshop.rows).toHaveLength(5);
    expect(site.workshop.rows!.map((r) => r.href)).toEqual(Array(5).fill(systems));
  });

  it("names only what is allowed", () => {
    const names = new Set<string>();
    for (const c of cards) {
      if (c.name) names.add(c.name);
      if (c !== site.newsstand) for (const r of c.rows ?? []) names.add(r.title);
    }
    expect([...names].sort()).toEqual(
      ["7series", "AI doom scroll", "Basketball", "Croqui", "Lifetree", "Maison", "Mirador", "Murim Life", "One on Roblox", "Quintal", "Socials Agent"].sort(),
    );
  });

  it("the Roblox row has no link", () => {
    const roblox = site.arcade.rows!.find((r) => r.title === "One on Roblox");
    expect(roblox).toBeDefined();
    expect(roblox!.href).toBeUndefined();
  });

  it("says Ink and Pixel is co-founded and opens inkandpixel.co", () => {
    expect(site.studio.line).toBe("Co-founded.");
    expect(site.studio.href).toBe("https://inkandpixel.co");
  });
});
