// Every word, link and picture name on the site lives here.
// Change the wording in this file and nothing else needs to be touched.

export type Kind =
  | "Websites"
  | "Systems"
  | "Games"
  | "Agents and bots"
  | "Films"
  | "Writing"
  | "Ink and Pixel"
  | "Basketball";

/** One line inside a card. With an `href` it is a link, without one it is plain text. */
export type Row = { title: string; note?: string; href?: string; picture?: string };

/** What a player card says about one thing on the block. */
export type Card = {
  kind: Kind;
  no?: string;
  name?: string;
  line: string;
  tags?: string[];
  rows?: Row[];
  /** File name in /public/cards, without the extension. */
  picture?: string;
  href?: string;
  button?: string;
  serial?: [string, string];
};

export type SiteContent = {
  name: string;
  title: string;
  description: string;
  /** Ten, in scroll order. `lineTouch` replaces `line` on touch screens. */
  stages: { title: string; line: string; lineTouch?: string }[];
  kinds: Record<Kind, { tag: string; color: string; ink: string }>;
  player: Card;
  robots: Card[];
  arcade: Card;
  workshop: Card;
  cinema: Card;
  newsstand: Card;
  shops: Card[];
  studio: Card;
  chat: {
    who: string;
    status: string;
    hello: string;
    close: string;
    tab: string;
    more: string;
    /** `a` may contain [words](https://address); the words become the link. */
    questions: { q: string; a: string; link?: [string, string] }[];
    footer: [string, string][];
  };
  hints: { scroll: string; pick: string; pickTouch: string; more: string };
};

const SYSTEMS = "https://inkandpixel.co/systems";
const no = (i: number) => `No. ${String(i + 1).padStart(2, "0")}`;

export const site: SiteContent = {
  name: "Hawi Oyugi",
  title: "Hawi Oyugi",
  description: "I like to build things. Co-founder of Ink and Pixel.",

  stages: [
    { title: "Hawi Oyugi", line: "I like to build things." },
    { title: "Agents and bots", line: "They answer guests, write the marketing, test the games." },
    { title: "Games", line: "Three so far. Two in the browser, one on Roblox." },
    { title: "Systems", line: "Five live systems you can try." },
    { title: "Films", line: "About twenty short promo films." },
    { title: "Writing", line: "A dump of my daily X doom scroll." },
    { title: "Websites", line: "About twenty five live, for restaurants, shops, studios and people." },
    { title: "Ink and Pixel", line: "Co-founded." },
    {
      title: "All of this in six months",
      line: "Click on anything on the block to go there.",
      lineTouch: "Tap anything on the block to go there.",
    },
    {
      title: "Next",
      line: "More of this. Building Ink and Pixel, building my own name, and excited to see how the world changes with AI.",
    },
  ],

  kinds: {
    Websites: { tag: "Website", color: "#2f6f5a", ink: "#f4f1ea" },
    Systems: { tag: "Systems", color: "#e0a23a", ink: "#1c1a17" },
    Games: { tag: "Games", color: "#4a2f8f", ink: "#f4f1ea" },
    "Agents and bots": { tag: "Agent", color: "#1fa08a", ink: "#0f201c" },
    Films: { tag: "Films", color: "#b8322f", ink: "#f4f1ea" },
    Writing: { tag: "Writing", color: "#1c1a17", ink: "#ffb02e" },
    "Ink and Pixel": { tag: "Studio", color: "#f0509b", ink: "#1c1a17" },
    Basketball: { tag: "Off the clock", color: "#d9651c", ink: "#1c1a17" },
  },

  player: {
    kind: "Basketball",
    name: "Basketball",
    line: "What I do when I am not building.",
    tags: ["go on, guard me"],
    serial: ["HO BKB 2026", "rookie year"],
  },

  robots: [
    "A concierge that answers guests.",
    "An agent that writes the weekly marketing.",
    "A bot that plays a game to test it.",
    "An assistant inside a company console.",
    "An agent that drafts social posts.",
  ].map<Card>((line, i) => ({ kind: "Agents and bots", no: no(i), line, tags: ["works on its own"] })),

  arcade: {
    kind: "Games",
    line: "Three so far. Two in the browser, one on Roblox.",
    tags: ["2 playable now"],
    rows: [
      { title: "Lifetree", note: "Plays in the browser", href: "https://lifetree-coral.vercel.app", picture: "lifetree" },
      { title: "Murim Life", note: "Plays in the browser", href: "https://murim-life-dusky.vercel.app", picture: "murim" },
      { title: "One on Roblox", note: "Built in Roblox Studio" },
    ],
  },

  workshop: {
    kind: "Systems",
    line: "Five live systems you can try.",
    tags: ["5 live", "co-built at Ink and Pixel"],
    href: SYSTEMS,
    button: "see the systems",
    rows: [
      { title: "Maison", note: "Menus, front desk and reviews for venues", href: SYSTEMS, picture: "maison" },
      { title: "Quintal", note: "Supplier paperwork for farm buyers", href: SYSTEMS, picture: "quintal" },
      { title: "Croqui", note: "From a brief to a concept deck, for architects", href: SYSTEMS, picture: "croqui" },
      { title: "Mirador", note: "One screen for sales, orders and stock", href: SYSTEMS, picture: "mirador" },
      { title: "Socials Agent", note: "A week of posts in your voice", href: SYSTEMS, picture: "socials" },
    ],
  },

  cinema: {
    kind: "Films",
    line: "About twenty short promo films, each under two minutes.",
    tags: ["about 20"],
  },

  // The rows of this card are the newest doom scroll headlines, read from the blog.
  newsstand: {
    kind: "Writing",
    name: "AI doom scroll",
    line: "A dump of my daily X doom scroll.",
    tags: ["short takes, most days"],
    picture: "doomscroll",
    href: "https://inkandpixel.co/blog/doom-scroll",
    button: "all the takes",
  },

  shops: (
    [
      { line: "A restaurant site, with the menu in 14 languages.", tags: ["live", "14 languages"] },
      {
        name: "7series",
        line: "An artisanal soap house from Côte d'Ivoire. Catalogue, stories and ordering by WhatsApp.",
        tags: ["live", "client work"],
        picture: "sevenseries",
        href: "https://inkandpixel.co/seven-series",
        button: "open it",
      },
      { line: "An art gallery site.", tags: ["live"] },
      { line: "An architect's site.", tags: ["live"] },
      { line: "A tax firm's site.", tags: ["live"] },
      { line: "A builder's site.", tags: ["live"] },
      { line: "A creator's site.", tags: ["live"] },
    ] as Omit<Card, "kind" | "no">[]
  ).map<Card>((shop, i) => ({ kind: "Websites", no: no(i), ...shop })),

  studio: {
    kind: "Ink and Pixel",
    line: "Co-founded.",
    tags: ["AI systems and creative branding"],
    picture: "inkandpixel",
    href: "https://inkandpixel.co",
    button: "inkandpixel.co",
  },

  chat: {
    who: "Hawi",
    status: "usually building",
    hello: "Ask me anything.",
    close: "the block",
    tab: "Ask me",
    more: "more questions",
    questions: [
      {
        q: "What do you do?",
        a: "I build things with AI: websites, systems, games, agents and short films. Most of it comes out of Ink and Pixel, the studio I co-founded.",
      },
      {
        q: "What is Ink and Pixel?",
        a: "The company I co-founded. We do AI systems, creative branding and marketing for companies: the look and voice, the website and the social posts your customers see, and the systems and agents your team runs on.",
        link: ["inkandpixel.co", "https://inkandpixel.co"],
      },
      { q: "Where are you based?", a: "Currently out of Barcelona, but originally I'm from Kenya." },
      {
        q: "What is the AI doom scroll?",
        a: "A dump of my daily X doom scroll. I spend too long on AI Twitter, so I pull out the stories worth knowing and write a short take on each one. It lives on the Ink and Pixel blog.",
        link: ["read the takes", "https://inkandpixel.co/blog/doom-scroll"],
      },
      {
        q: "Do you actually hoop?",
        a: "Yes, and I'm accepting 1v1 challenges anytime, any day. You pick the place.",
      },
      {
        q: "What is next?",
        a: "More of this. Building Ink and Pixel, building my own name, and excited to see how the world changes with AI.",
      },
      {
        q: "Can we work together?",
        a: "For a project, start at Ink and Pixel. To reach me directly, message me on [LinkedIn](https://www.linkedin.com/in/hawi-oyugi/).",
      },
    ],
    footer: [
      ["LinkedIn", "https://www.linkedin.com/in/hawi-oyugi/"],
      ["X", "https://x.com/paroadster"],
      ["Ink and Pixel", "https://inkandpixel.co"],
    ],
  },

  hints: {
    scroll: "scroll",
    pick: "click it, then pick one",
    pickTouch: "tap it, then pick one",
    more: "more",
  },
};
