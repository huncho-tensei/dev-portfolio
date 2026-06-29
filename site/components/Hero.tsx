"use client";

import { motion } from "motion/react";
import { site } from "@/lib/site";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { Gloss } from "@/components/Gloss";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16"
      >
        {/* Left: statement */}
        <div>
          <motion.p variants={item} className="font-display text-sm font-medium text-[var(--color-dim)] uppercase tracking-widest">
            Open to work · Barcelona
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.03em] text-[var(--color-bone)] overflow-wrap-anywhere min-w-0"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
          >
            Idea to production, on repeat.
          </motion.h1>

          <motion.div variants={item}>
            <Gloss>
              "Production" means it&apos;s live and being used by real people,
              not a prototype or side project that never left my laptop.
            </Gloss>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-7 font-display text-lg leading-relaxed text-[var(--color-dim)] max-w-md"
          >
            Kenyan founder and Barcelona student, shipping security tools,
            prediction engines, and agent systems from idea to production.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#work" className="btn-primary">
              See the work →
            </a>
            <a href={site.links.github} target="_blank" rel="noreferrer noopener" className="btn-ghost">
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noreferrer noopener" className="btn-ghost">
              <LinkedInIcon className="h-4 w-4" />
              LinkedIn
            </a>
          </motion.div>
        </div>

        {/* Right: portrait */}
        <motion.div variants={item} className="hidden md:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-surface)]">
            {/*
              PORTRAIT SLOT — drop site/public/portrait.jpg and replace with:
              <Image src="/portrait.jpg" alt="Hawi Oyugi" fill className="object-cover" />
            */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--line-strong)] font-display text-3xl font-bold text-[var(--color-bone)]">
                HO
              </span>
              <span className="font-display text-sm text-[var(--color-faint)]">
                Portrait coming soon
              </span>
            </div>
            {/* Kenyan flag accent strip at bottom */}
            <div className="absolute bottom-0 inset-x-0 flex h-1">
              <div className="flex-1 bg-[var(--color-red)]" />
              <div className="flex-1 bg-[var(--color-bone)]" />
              <div className="flex-1 bg-[var(--color-green)]" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
