import Link from "next/link";
import type { Project } from "@/lib/projects";
import { ArrowUpRight } from "@/components/icons";
import { Carousel } from "@/components/Carousel";

export function ProjectCard({ project }: { project: Project }) {
  const hasShots = project.shots && project.shots.length > 0;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group grid grid-cols-1 gap-8 border-b border-[var(--line)] py-12 transition-colors first:border-t md:grid-cols-2 md:gap-16 md:py-14"
    >
      {/* Image slot */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--color-surface)]">
        {hasShots ? (
          <Carousel images={project.shots!} alt={project.title} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-sm font-medium text-[var(--color-faint)]">
              {project.title}
            </span>
          </div>
        )}
        {project.domain && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-[var(--color-ink-raised)] px-2.5 py-1 font-display text-xs font-medium text-[var(--color-dim)]">
            {project.domain}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between">
        <div>
          <h3
            className="font-display font-bold leading-tight tracking-[-0.02em] text-[var(--color-bone)] transition-colors group-hover:text-[var(--color-red)]"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
          >
            {project.title}
          </h3>
          <p className="mt-4 font-display text-base leading-relaxed text-[var(--color-dim)]">
            {project.tagline}
          </p>
        </div>

        <div className="mt-8">
          <div className="border-t border-[var(--line)] pt-6">
            <div className="grid grid-cols-2 gap-y-3 font-display text-sm">
              <span className="text-[var(--color-faint)]">Year</span>
              <span className="text-[var(--color-dim)]">{project.year}</span>
              <span className="text-[var(--color-faint)]">Stack</span>
              <span className="text-[var(--color-dim)] leading-snug">
                {project.stack.slice(0, 3).join(", ")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1 font-display text-sm font-semibold text-[var(--color-green-soft)] transition-colors group-hover:text-[var(--color-bone)]">
            View project
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
