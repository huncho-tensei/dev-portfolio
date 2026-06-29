import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ProjectStatus = "shipped" | "live" | "open-source" | "active";

export interface ProjectLinks {
  github?: string;
  live?: string;
  npm?: string;
  oss?: string;
  pr?: string;
  issue?: string;
  fork?: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  featured: boolean;
  order: number;
  year: string;
  domain: string;
  stack: string[];
  links: ProjectLinks;
  /** raw markdown body with the leading H1 + Links section stripped */
  body: string;
  /** named diagram component to render (e.g. "agency") */
  diagram?: string;
  /** ordered list of image filenames in public/shots/ */
  shots?: string[];
}

const STATUS_RANK: Record<ProjectStatus, number> = {
  shipped: 0,
  live: 1,
  "open-source": 2,
  active: 3,
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  live: "Live",
  "open-source": "Open Source",
  active: "Active",
};

// Content lives in ../projects relative to the site/ app. Resolve defensively so
// the build works whether cwd is the app dir (local) or the repo root (some CI
// setups), and fail loud rather than silently shipping an empty site.
function resolveProjectsDir(): string {
  const candidates = [
    path.join(process.cwd(), "..", "projects"),
    path.join(process.cwd(), "projects"),
    path.join(process.cwd(), "content", "projects"),
  ];
  return candidates.find((dir) => fs.existsSync(dir)) ?? candidates[0];
}

const PROJECTS_DIR = resolveProjectsDir();

/**
 * Strip the parts of a body that the branded detail header already shows:
 * the title H1 and its one line summary (everything before the first section
 * heading), plus the "## Links" block. The title, tagline and links all come
 * from frontmatter instead.
 */
export function stripRedundantSections(markdown: string): string {
  const lines = markdown.split("\n");

  // drop the H1 and intro blurb: keep from the first "## " heading onward
  const firstH2 = lines.findIndex((l) => /^##\s+/.test(l));
  const body = firstH2 >= 0 ? lines.slice(firstH2) : lines;

  const out: string[] = [];
  let skippingLinks = false;
  for (const line of body) {
    // drop a "## Links" block until the next H2
    if (/^##\s+Links\s*$/i.test(line)) {
      skippingLinks = true;
      continue;
    }
    if (skippingLinks) {
      if (/^##\s+/.test(line)) {
        skippingLinks = false;
        out.push(line);
      }
      continue;
    }
    out.push(line);
  }
  return out.join("\n").trim();
}

function readProject(slug: string): Project | null {
  const file = path.join(PROJECTS_DIR, slug, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  // require frontmatter we depend on; skip files that aren't real entries
  if (!data.title || !data.status) return null;

  return {
    slug: (data.slug as string) ?? slug,
    title: data.title as string,
    tagline: (data.tagline as string) ?? "",
    status: data.status as ProjectStatus,
    featured: Boolean(data.featured),
    order: typeof data.order === "number" ? data.order : 999,
    year: String(data.year ?? ""),
    domain: (data.domain as string) ?? "",
    stack: Array.isArray(data.stack) ? (data.stack as string[]) : [],
    links: (data.links as ProjectLinks) ?? {},
    diagram: data.diagram as string | undefined,
    shots: Array.isArray(data.shots) ? (data.shots as string[]) : undefined,
    body: stripRedundantSections(content),
  };
}

export function compareProjects(a: Project, b: Project): number {
  const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (rank !== 0) return rank;
  return a.order - b.order;
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const slugs = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return slugs
    .map(readProject)
    .filter((p): p is Project => p !== null)
    .sort(compareProjects);
}

export function getProject(slug: string): Project | undefined {
  return readProject(slug) ?? undefined;
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured);
}
