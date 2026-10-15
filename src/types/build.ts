export type Build = {
  slug: string;
  title: string;
  move: string;
  description: string;
  tips: string[];
  partners: number[];
  supportMoves: string[];
  items: string[];
};

export type BuildPreview = {
  slug: string;
  title: string;
  description: string;
  lead: { id: number; name: string; };
  partners: { id: number; name: string; }[];
  move: { id: string; name: string; type: string; evolution: string; requirement: string; };
  support: { id: string; name: string; slug: string; evolution: string | null; requirement: string | null }[];
  tips: string[];
  items: { id: string; name: string; description: string }[];
};
