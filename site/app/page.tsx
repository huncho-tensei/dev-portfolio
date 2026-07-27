import { getAllProjects } from "@/lib/projects";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";

export default function Home() {
  const projects = getAllProjects();

  return (
    <>
      <Hero />

      {/* WORK */}
      <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <SectionHeading title="Featured projects" />
        <ProjectGrid projects={projects} />
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <SectionHeading title="About me" />
        <About />
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Left */}
          <Reveal>
            <h2
              className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-[var(--color-bone)]"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}
            >
              Let&apos;s connect.
            </h2>
            <p className="mt-6 font-display text-base leading-relaxed text-[var(--color-dim)] max-w-sm">
              Hiring in Barcelona, building something interesting, or just
              want to compare notes? Drop a line. I read everything.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline inline-flex items-center gap-3 font-display text-sm font-medium text-[var(--color-dim)] transition-colors hover:text-[var(--color-bone)]"
              >
                <GitHubIcon className="h-4 w-4" />
                github.com/huncho-tensei
              </a>
              <a
                href={site.links.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline inline-flex items-center gap-3 font-display text-sm font-medium text-[var(--color-dim)] transition-colors hover:text-[var(--color-bone)]"
              >
                <LinkedInIcon className="h-4 w-4" />
                linkedin.com/in/hawi-oyugi
              </a>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal delay={0.08}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
