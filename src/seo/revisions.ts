import revisions from "@/data/seo/page-revisions.json";
type Revision = { hash: string; lastModified: string };
export function pageUpdatedAt(path: string) {
  return (revisions as Record<string, Revision>)[path]?.lastModified ?? "2026-10-15";
}
