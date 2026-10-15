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
  sections: { id: string; title: string; paragraphs: string[] }[];
};
