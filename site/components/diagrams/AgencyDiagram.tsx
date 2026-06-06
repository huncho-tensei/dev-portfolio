interface Domain {
  label: string;
  director: string;
  model?: string;
  specialists: string[];
}

const DOMAINS: Domain[] = [
  { label: "Agency Mgmt", director: "Atlas", model: "Sonnet", specialists: ["Atlas Deep · Opus"] },
  {
    label: "Trade Ops",
    director: "Franklin",
    specialists: ["Customs Filing", "Freight Booking", "Shipment Tracking", "Trade Route Advisor"],
  },
  { label: "Career", director: "Harvey", specialists: ["CV Writer"] },
  { label: "University", director: "Dissertation", specialists: ["Scholar · pre-alpha"] },
  { label: "Life Planning", director: "Caesar", specialists: [] },
];

function Node({
  name,
  variant,
}: {
  name: string;
  variant: "director" | "specialist";
}) {
  const isDirector = variant === "director";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-lg border px-3 py-2 font-display text-sm ${
        isDirector
          ? "border-[var(--color-red)] bg-[oklch(40%_0.19_27_/_0.1)] font-semibold text-[var(--color-bone)]"
          : "border-[var(--line)] bg-[var(--color-ink-raised)] text-[var(--color-dim)]"
      }`}
    >
      {isDirector && <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[var(--color-red)]" />}
      {name}
    </span>
  );
}

export function AgencyDiagram() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-[var(--line)] p-6 sm:p-8">
      <figcaption className="mb-7 flex items-end justify-between">
        <span className="font-display text-sm font-medium text-[var(--color-faint)]">Routing topology</span>
        <span className="font-display text-sm text-[var(--color-faint)]">13 agents · 5 domains</span>
      </figcaption>

      <div className="flex flex-col divide-y divide-[var(--line)]">
        {DOMAINS.map((d) => (
          <div
            key={d.label}
            className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 md:flex-row md:items-center"
          >
            <div className="w-40 shrink-0">
              <span className="font-display text-sm font-medium text-faint">{d.label}</span>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-3">
              <Node name={`${d.director}${d.model ? ` · ${d.model}` : ""}`} variant="director" />
              {d.specialists.length > 0 && (
                <>
                  <span aria-hidden className="hidden h-px w-6 bg-[var(--line-strong)] sm:block" />
                  {d.specialists.map((s) => (
                    <Node key={s} name={s} variant="specialist" />
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
