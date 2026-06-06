import Link from "next/link";
import { site } from "@/lib/site";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="font-display text-sm font-bold text-[var(--color-bone)]">
          Hawi Oyugi
        </Link>

        <div className="flex items-center gap-6">
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="link-underline font-display text-sm text-[var(--color-dim)] transition-colors hover:text-[var(--color-bone)]"
          >
            GitHub
          </a>
          <a
            href={site.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="link-underline font-display text-sm text-[var(--color-dim)] transition-colors hover:text-[var(--color-bone)]"
          >
            LinkedIn
          </a>
          <p className="font-display text-sm text-[var(--color-faint)]">
            © {year} Hawi Oyugi
          </p>
        </div>
      </div>
    </footer>
  );
}
