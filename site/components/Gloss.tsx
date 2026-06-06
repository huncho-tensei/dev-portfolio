import type { ReactNode } from "react";

/**
 * A plain-English gloss. Hidden by default; revealed when the Explain toggle is
 * on (CSS keys off html[data-explain="on"]). Use `block` for a note that sits
 * between lines, or inline for a short parenthetical inside a sentence.
 */
export function Gloss({
  children,
  inline = false,
}: {
  children: ReactNode;
  inline?: boolean;
}) {
  return <span className={inline ? "gloss-inline" : "gloss"}>{children}</span>;
}
