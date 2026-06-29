"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { ExplainToggle } from "@/components/ExplainToggle";

const NAV_LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--line)] bg-[oklch(8%_0_0_/_0.88)] backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-base font-bold tracking-tight text-bone"
          aria-label="Home"
        >
          Hawi Oyugi
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-7 sm:flex">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-display text-sm font-medium text-[var(--color-dim)] transition-colors hover:text-[var(--color-bone)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ExplainToggle />
          <a href={site.cvHref} target="_blank" rel="noreferrer noopener" className="btn-ghost text-sm py-1.5 px-4">
            CV
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-4 sm:hidden">
          <ExplainToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`block h-px w-5 bg-[var(--color-bone)] transition-all duration-200 ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-[var(--color-bone)] transition-all duration-200 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--color-ink)] px-5 pb-6 pt-4 sm:hidden">
          <ul className="flex flex-col gap-5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block font-display text-lg font-semibold text-[var(--color-bone)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={site.cvHref} target="_blank" rel="noreferrer noopener" className="btn-ghost mt-6 w-full justify-center">
            CV
          </a>
        </div>
      )}
    </header>
  );
}
