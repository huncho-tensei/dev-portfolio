import type { SiteContent } from "../content/site";

/** One doom scroll headline, as the newsstand shows it. */
export type Headline = { title: string; date: string; href: string };

/**
 * Starts the pixel scene inside `root` (the element Block.tsx renders).
 * Returns a function that stops it and cleans up, or null if the browser cannot draw the scene.
 */
export function mountBlock(root: HTMLElement, content: SiteContent, headlines: Headline[]): (() => void) | null;
