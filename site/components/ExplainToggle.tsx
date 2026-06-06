"use client";

import { useEffect, useSyncExternalStore } from "react";

const KEY = "explain-mode";
const EVENT = "explain-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
const getSnapshot = () => localStorage.getItem(KEY) === "on";
const getServerSnapshot = () => false;

export function ExplainToggle() {
  const on = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // keep the <html> attribute (which drives the gloss CSS) in sync with the store
  useEffect(() => {
    document.documentElement.dataset.explain = on ? "on" : "off";
  }, [on]);

  const toggle = () => {
    localStorage.setItem(KEY, on ? "off" : "on");
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={on}
      aria-label="Explain the jargon in plain English"
      className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--line-strong)] py-1.5 pl-3 pr-1.5 font-display text-[0.9rem] transition-colors hover:border-explain"
      style={{ color: on ? "var(--color-explain)" : "var(--color-dim)" }}
    >
      Explain
      <span
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
        style={{
          backgroundColor: on
            ? "var(--color-explain)"
            : "color-mix(in srgb, var(--color-bone) 16%, transparent)",
        }}
      >
        <span
          className="absolute h-3.5 w-3.5 rounded-full bg-ink transition-transform duration-300"
          style={{ transform: on ? "translateX(18px)" : "translateX(3px)" }}
        />
      </span>
    </button>
  );
}
