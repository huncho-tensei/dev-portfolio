export const site = {
  name: "Hawi Oyugi",
  shortName: "Hawi",
  // story-led hero one-liner
  role: "Kenyan founder · Barcelona student · full time builder",
  tagline:
    "I build AI tools and ship them. Security scanners, prediction engines, agent systems, and the products in between.",
  location: "Barcelona, ES · Nairobi, KE",
  email: "", // hidden, contact routes through the form
  cvHref: "/cv.pdf", // placeholder until Hawi provides the PDF
  links: {
    github: "https://github.com/huncho-tensei",
    linkedin: "https://www.linkedin.com/in/hawi-oyugi/",
  },
} as const;

export type SiteConfig = typeof site;
