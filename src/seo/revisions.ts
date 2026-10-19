import manifest from "../../public/.well-known/seo-url-manifest.json";
export { manifest };
export function pageUpdatedAt(path: string) {
  const entry = manifest.entries.find(entry => entry.path === path);
  if (!entry) throw new Error(`Unregistered SEO page: ${path}`);
  return entry.lastModified;
}
