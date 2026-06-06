import type { Project } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map((p, i) => (
        <Reveal key={p.slug} delay={i * 0.05}>
          <ProjectCard project={p} />
        </Reveal>
      ))}
    </div>
  );
}
