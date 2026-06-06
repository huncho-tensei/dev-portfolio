"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/lib/contact";

const initial: ContactState = { status: "idle", message: "" };

const TONE: Record<ContactState["status"], string> = {
  idle: "",
  success: "text-[var(--color-green-soft)]",
  error: "text-[var(--color-red-soft)]",
  unconfigured: "text-[var(--color-dim)]",
};

const fieldClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--color-surface)] px-4 py-3.5 font-display text-[var(--color-bone)] placeholder:text-[var(--color-faint)] transition-colors focus:border-[var(--color-red)] focus:outline-none text-sm";

const labelClass = "font-display text-sm font-medium text-[var(--color-dim)]";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const done = state.status === "success";

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Name</span>
          <input name="name" type="text" required placeholder="Your name" className={fieldClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Email</span>
          <input name="email" type="email" required placeholder="you@company.com" className={fieldClass} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Message</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What are you building, or what's the opportunity?"
          className={`${fieldClass} resize-none`}
        />
      </label>

      <div className="mt-1 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={pending || done}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : done ? "Sent" : "Send message →"}
        </button>

        {state.message && (
          <p role="status" className={`font-display text-sm ${TONE[state.status]}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
