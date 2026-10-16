export type Guide = {
  slug: string;
  seo: { title: string; description: string; targetKeywords: string[] };
  title: string;
  heading: string;
  cardTitle: string;
  description: string;
  icon: string;
  image: string;
  imageAlt: string;
  category: string;
  readTime: number;
  outcomes: string[];
  sources: string[];
  sections: GuideSection[];
};
export type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: string[];
  table?: { caption: string; columns: string[]; rows: string[][] };
  comparisons?: { id: number; name: string; note: string }[];
  callout?: { title: string; text: string };
  questions?: { question: string; answer: string }[];
  links?: { label: string; href: string }[];
};
