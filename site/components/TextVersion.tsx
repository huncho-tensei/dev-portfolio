import type { Card, SiteContent } from "@/content/site";
import type { Headline } from "@/scene/index";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** An answer with its [words](address) turned into real links. */
function Answer({ text, link }: { text: string; link?: [string, string] }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[2]}>
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return (
    <>
      {parts}
      {link && (
        <>
          {" "}
          <a href={link[1]}>{link[0]}</a>
        </>
      )}
    </>
  );
}

function CardText({ card }: { card: Card }) {
  return (
    <li>
      {card.name && <strong>{card.name}. </strong>}
      {card.line}
      {card.href && (
        <>
          {" "}
          <a href={card.href}>{card.button ?? card.href.replace(/^https:\/\//, "")}</a>
        </>
      )}
      {card.rows && (
        <ul>
          {card.rows.map((row) => (
            <li key={row.title}>
              {row.href ? <a href={row.href}>{row.title}</a> : row.title}
              {row.note && `: ${row.note}`}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Everything the pixel scene says, as ordinary HTML. Search engines and screen readers read this,
 * and it is what a visitor sees if their browser cannot draw the scene.
 */
export function TextVersion({ content, headlines }: { content: SiteContent; headlines: Headline[] }) {
  const stage = (title: string) => content.stages.find((s) => s.title === title)!;
  const newsstand: Card = {
    ...content.newsstand,
    rows: headlines.slice(0, 3).map((h) => ({ title: h.title, note: h.date, href: h.href })),
  };
  // Each kind of work, in the order it appears on the block, with the cards that belong to it.
  const sections: { title: string; cards: Card[] }[] = [
    { title: "Agents and bots", cards: content.robots },
    { title: "Games", cards: [content.arcade] },
    { title: "Systems", cards: [content.workshop] },
    { title: "Films", cards: [content.cinema] },
    { title: "Writing", cards: [newsstand] },
    { title: "Websites", cards: content.shops },
    { title: "Ink and Pixel", cards: [content.studio] },
  ];
  const summary = content.stages[8];
  const next = content.stages[9];

  return (
    <article className="text">
      <h1>{content.name}</h1>
      <p>{content.stages[0].line}</p>

      {sections.map(({ title, cards }) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{stage(title).line}</p>
          <ul>
            {cards.map((card, i) => (
              <CardText key={`${title}-${i}`} card={card} />
            ))}
          </ul>
        </section>
      ))}

      <section>
        <h2>{summary.title}</h2>
      </section>

      <section>
        <h2>{next.title}</h2>
        <p>{next.line}</p>
      </section>

      <section>
        <h2>{content.chat.hello}</h2>
        <dl>
          {content.chat.questions.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>
                <Answer text={item.a} link={item.link} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer>
        {content.chat.footer.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </footer>
    </article>
  );
}
