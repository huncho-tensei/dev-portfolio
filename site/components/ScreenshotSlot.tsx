/**
 * Placeholder for a project screenshot. When Hawi supplies an image, drop it at
 * site/public/shots/<slug>.png and render it with next/image in place of this.
 */
export function ScreenshotSlot({ label }: { label: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-[var(--line)] bg-grid">
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line-strong)] text-dim">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
            <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth="1.6" />
            <path d="m3 14 4-3 4 3 3-2 4 3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="8.5" r="1.4" />
          </svg>
        </span>
        <span className="font-display text-sm font-medium text-dim">{label}</span>
        <span className="font-display text-sm text-[var(--color-faint)]">Screenshot coming soon</span>
      </div>
    </figure>
  );
}
