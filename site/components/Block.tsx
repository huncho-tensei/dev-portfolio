"use client";

import { useEffect, useRef } from "react";
import type { SiteContent } from "@/content/site";
import type { Headline } from "@/scene/index";

/**
 * The frame the pixel scene lives in. React draws the fixed pieces (the pinned stage, the title
 * slot, the empty card, the chat shell); the scene app in /scene brings them to life in the browser.
 */
export function Block({ content, headlines }: { content: SiteContent; headlines: Headline[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dispose: (() => void) | null = null;
    let gone = false;
    import("@/scene/index.js").then(({ mountBlock }) => {
      if (gone || !root.current) return;
      dispose = mountBlock(root.current, content, headlines);
      document.body.classList.toggle("scene-on", dispose !== null);
    });
    return () => {
      gone = true;
      dispose?.();
      document.body.classList.remove("scene-on");
    };
  }, [content, headlines]);

  const { chat } = content;
  return (
    <div id="scroller" ref={root}>
      <div id="pin">
        <div id="stage" />
        <header id="top">
          <div>
            <b>{content.name}</b>
          </div>
        </header>
        <svg id="lead" aria-hidden="true">
          <polyline points="" />
          <rect width="8" height="8" />
        </svg>
        <div id="cap" aria-hidden="true">
          <h2 />
          <p />
        </div>
        <div id="hint" aria-hidden="true">
          {content.hints.scroll}
        </div>
        <div id="card" />
        <section id="chat" aria-label={chat.hello}>
          <header>
            <canvas id="avatar" aria-hidden="true" />
            <div>
              <b>{chat.who}</b>
              <small>{chat.status}</small>
            </div>
            <button type="button" id="chatx">
              {chat.close}
            </button>
          </header>
          <div id="thread" />
          <footer>
            {chat.footer.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener">
                {label}
              </a>
            ))}
          </footer>
        </section>
        <button type="button" id="asktab">
          <canvas id="tabface" aria-hidden="true" />
          {chat.tab}
        </button>
        <canvas id="ballfx" aria-hidden="true" />
      </div>
    </div>
  );
}
