import { Reveal } from "@/components/motion/Reveal";

export function SectionHeading({
  title,
  className = "",
}: {
  title: string;
  label?: string;
  className?: string;
}) {
  return (
    <Reveal className={`mb-14 ${className}`}>
      <h2 className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-[var(--color-bone)]"
        style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>
        {title}
      </h2>
    </Reveal>
  );
}
