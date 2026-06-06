import { Reveal } from "@/components/motion/Reveal";
import { Gloss } from "@/components/Gloss";

const NOW = [
  "Building Twende, an AI consultancy out of Nairobi",
  "Final year Business Management student in Barcelona, graduating June 2026",
  "Shipping side projects most weeks, and learning how to trade",
];

export function About() {
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
      {/* Left: portrait */}
      <Reveal>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-surface)]">
          {/*
            PORTRAIT SLOT — drop site/public/portrait.jpg and replace with:
            <Image src="/portrait.jpg" alt="Hawi Oyugi" fill className="object-cover" />
          */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line-strong)] font-display text-2xl font-bold text-[var(--color-bone)]">
              HO
            </span>
            <span className="font-display text-sm text-[var(--color-faint)]">
              Portrait coming soon
            </span>
          </div>
        </div>
      </Reveal>

      {/* Right: story */}
      <div>
        <Reveal>
          <p className="font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-[var(--color-bone)] sm:text-3xl">
            I find a problem worth solving, design the system around it, and
            ship it to real users.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 space-y-5 font-display text-base leading-relaxed text-[var(--color-dim)]">
            <p>
              I am a Kenyan founder and a final year Business Management student
              in Barcelona. My work lives where product instinct meets
              engineering. I am as comfortable working out what people actually
              need as I am writing the code, the tests, and getting it live.
            </p>
            <p>
              Over the past few months that has meant a published security tool,
              a live World Cup prediction engine built on real research, a
              contribution to an open catalog the opencode team uses, and a
              workspace of 13 AI agents that runs my day.
            </p>
            <Gloss>
              An open catalog is a public, shared database anyone can read or
              add to. A contribution the opencode team accepted is a real stamp
              of quality.
            </Gloss>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <ul className="mt-10 space-y-3 border-t border-[var(--line)] pt-8">
            {NOW.map((n) => (
              <li key={n} className="flex items-start gap-3 font-display text-sm text-[var(--color-dim)]">
                <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--color-red)]" />
                {n}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
