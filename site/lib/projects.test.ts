import { describe, it, expect } from "vitest";
import {
  stripRedundantSections,
  compareProjects,
  getAllProjects,
  getFeaturedProjects,
  type Project,
  type ProjectStatus,
} from "./projects";

const make = (
  status: ProjectStatus,
  order: number,
  slug: string = status,
): Project => ({
  slug,
  title: slug,
  tagline: "",
  status,
  featured: false,
  order,
  year: "2026",
  domain: "",
  stack: [],
  links: {},
  body: "",
});

describe("stripRedundantSections", () => {
  it("drops the H1, the intro blurb, and the Links section, keeps the sections", () => {
    const md = [
      "# ext-scan",
      "",
      "A scanner.",
      "",
      "## Links",
      "",
      "- GitHub: https://example.com",
      "",
      "## The Problem",
      "",
      "Extensions are risky.",
    ].join("\n");

    const out = stripRedundantSections(md);
    expect(out).not.toContain("# ext-scan");
    expect(out).not.toContain("## Links");
    expect(out).not.toContain("https://example.com");
    expect(out).not.toContain("A scanner."); // intro blurb dropped (tagline lives in frontmatter)
    expect(out).toContain("## The Problem");
    expect(out).toContain("Extensions are risky.");
  });

  it("does not strip an H2 that merely contains the word Links", () => {
    const md = "# T\n\n## Useful Links And More\n\nkeep me";
    const out = stripRedundantSections(md);
    expect(out).toContain("## Useful Links And More");
    expect(out).toContain("keep me");
  });
});

describe("compareProjects", () => {
  it("orders by status rank: shipped < live < open-source < active", () => {
    const sorted = [
      make("active", 1),
      make("open-source", 1),
      make("live", 1),
      make("shipped", 1),
    ].sort(compareProjects);
    expect(sorted.map((p) => p.status)).toEqual([
      "shipped",
      "live",
      "open-source",
      "active",
    ]);
  });

  it("breaks ties within a status by order ascending", () => {
    const sorted = [
      make("shipped", 3, "c"),
      make("shipped", 1, "a"),
      make("shipped", 2, "b"),
    ].sort(compareProjects);
    expect(sorted.map((p) => p.slug)).toEqual(["a", "b", "c"]);
  });
});

describe("getAllProjects (reads real content)", () => {
  const all = getAllProjects();

  it("loads all six portfolio projects", () => {
    expect(all).toHaveLength(6);
  });

  it("puts a shipped/live project first and an active one last", () => {
    expect(all[0].status === "shipped" || all[0].status === "live").toBe(true);
    expect(all[all.length - 1].status).toBe("active");
  });

  it("leads with ext-scan (shipped, order 1)", () => {
    expect(all[0].slug).toBe("ext-scan");
  });

  it("strips redundant sections from every body", () => {
    for (const p of all) {
      expect(p.body).not.toMatch(/^#\s+/m);
      expect(p.body).not.toMatch(/^##\s+Links\s*$/m);
      expect(p.body.length).toBeGreaterThan(50);
    }
  });

  it("features exactly ext-scan and penalty-predictor", () => {
    expect(getFeaturedProjects().map((p) => p.slug).sort()).toEqual([
      "ext-scan",
      "penalty-predictor",
    ]);
  });
});
