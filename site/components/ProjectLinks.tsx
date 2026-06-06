import type { ProjectLinks as Links } from "@/lib/projects";
import { ArrowUpRight } from "@/components/icons";

const LABELS: Record<keyof Links, string> = {
  live: "Live demo",
  github: "GitHub",
  npm: "npm",
  pr: "Pull request",
  oss: "OSS contribution",
  issue: "Issue",
  fork: "Fork",
};

const ORDER: (keyof Links)[] = ["live", "github", "npm", "pr", "oss", "issue", "fork"];

export function ProjectLinks({ links }: { links: Links }) {
  const entries = ORDER.filter((k) => links[k]).map((k) => [k, links[k]!] as const);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {entries.map(([key, href], i) => {
        const primary = i === 0;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className={
              primary
                ? "btn-primary"
                : "group link-underline inline-flex items-center gap-1.5 font-display text-sm text-[var(--color-dim)] transition-colors hover:text-[var(--color-bone)]"
            }
          >
            {LABELS[key]}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        );
      })}
    </div>
  );
}
