import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects, getProject } from "@/lib/projects";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectLinks } from "@/components/ProjectLinks";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AgencyDiagram } from "@/components/diagrams/AgencyDiagram";
import { ScreenshotSlot } from "@/components/ScreenshotSlot";
import { ArrowRight, ArrowUpRight } from "@/components/icons";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getAllProjects();
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all[(idx + 1) % all.length];

  return (
    <article className="mx-auto max-w-3xl px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 font-display text-sm text-[var(--color-dim)] transition-colors hover:text-[var(--color-red)]"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        All projects
      </Link>

      {/* Header */}
      <header className="mt-10 border-b border-[var(--line)] pb-10">
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="font-display text-sm text-[var(--color-faint)]">
            {project.domain} · {project.year}
          </span>
        </div>

        <h1
          className="mt-6 font-display font-bold leading-[0.95] tracking-[-0.03em] text-[var(--color-bone)]"
          style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
        >
          {project.title}
        </h1>
        <p className="mt-5 max-w-2xl font-display text-xl leading-relaxed text-[var(--color-dim)]">
          {project.tagline}
        </p>

        <p className="mt-5 font-display text-sm text-[var(--color-faint)]">
          {project.stack.join("  ·  ")}
        </p>

        <div className="mt-7">
          <ProjectLinks links={project.links} />
        </div>
      </header>

      {/* Visual */}
      {(project.diagram || project.screenshot) && (
        <div className="mt-10 flex flex-col gap-6">
          {project.diagram === "agency" && <AgencyDiagram />}
          {project.screenshot && <ScreenshotSlot label={`${project.title} interface`} />}
        </div>
      )}

      {/* Body */}
      <div className="mt-6">
        <MarkdownRenderer content={project.body} />
      </div>

      {/* Next project */}
      <Link
        href={`/projects/${next.slug}`}
        className="group mt-16 flex items-center justify-between gap-6 rounded-2xl border border-[var(--line)] p-8 transition-colors hover:border-[var(--color-red)]"
      >
        <div>
          <span className="font-display text-sm text-[var(--color-faint)]">Next project</span>
          <p className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-[var(--color-bone)] transition-colors group-hover:text-[var(--color-red)]">
            {next.title}
          </p>
        </div>
        <ArrowUpRight className="h-6 w-6 shrink-0 text-[var(--color-faint)] transition-all group-hover:text-[var(--color-red)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
