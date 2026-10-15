import data from "@/data/guides/guides.json";
import type { Guide } from "@/types/guide";
export const guides: Guide[] = data;
export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
