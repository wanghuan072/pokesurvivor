import crypto from "node:crypto";
import { assertManifest, assertManifestPair, assertCheckpointPair } from "./manifest-contract.mjs";
import { SITE_URL } from "./config.mjs";

export const FINGERPRINT_VERSION = "seo-v2";
export const MANIFEST_PATH = "/.well-known/seo-url-manifest.json";
export const fingerprint = (hash, indexable) => "sha256:" + crypto.createHash("sha256").update(JSON.stringify({hash,indexable})).digest("hex");
export function buildManifest(previous, hashes, routes, now, indexable = true) {
  if (previous) assertManifest(previous, "previous production");
  if (previous && Date.parse(now)<Date.parse(previous.generatedAt)) throw new Error("Manifest generatedAt must not move backward");
  if (previous && previous.fingerprintVersion !== FINGERPRINT_VERSION) throw new Error("Fingerprint version changed: an explicit migration is required");
  const old = new Map(previous?.entries.map(e => [e.canonicalUrl,e]) ?? []);
  const entries = routes.map(route => {
    if (!hashes[route.path]) throw new Error(`Missing page fingerprint: ${route.path}`);
    const eligible = indexable && route.indexable;
    // Preview's global noindex must not rewrite the canonical content history.
    const contentFingerprint = fingerprint(hashes[route.path], route.indexable);
    const prior = old.get(route.canonicalUrl);
    return { path:route.path, canonicalUrl:route.canonicalUrl, indexable:eligible, contentFingerprint,
      lastModified:prior?.contentFingerprint === contentFingerprint ? prior.lastModified : now };
  }).sort((a,b)=>a.canonicalUrl < b.canonicalUrl ? -1 : a.canonicalUrl > b.canonicalUrl ? 1 : 0);
  const eligible = new Set(entries.filter(e=>e.indexable).map(e=>e.canonicalUrl));
  const deletedUrls = [...new Set([...(previous?.deletedUrls ?? []),...(previous?.entries.filter(e=>e.indexable && !eligible.has(e.canonicalUrl)).map(e=>e.canonicalUrl) ?? [])])].filter(url=>!eligible.has(url)).sort();
  // Keep the deletion event until a successful notification acknowledges it.
  // Re-publishing clears it, so deleting the same URL again gets a fresh version.
  const deletedAt = Object.fromEntries(deletedUrls.map(url => [url,
    old.get(url)?.indexable ? now : previous?.deletedAt?.[url] ?? previous?.generatedAt ?? now,
  ]));
  const manifest = { schemaVersion:1, fingerprintVersion:FINGERPRINT_VERSION, siteUrl:SITE_URL, generatedAt:now, entries, deletedUrls, deletedAt };
  assertManifest(manifest);
  if (previous) assertManifestPair(manifest,previous);
  return manifest;
}
export function manifestDiff(previous, current) {
  assertManifest(current);
  if (previous) { assertManifest(previous); assertCheckpointPair(current,previous); }
  const old = new Map(previous?.entries.filter(e=>e.indexable).map(e=>[e.canonicalUrl,e]) ?? []);
  const next = new Map(current.entries.filter(e=>e.indexable).map(e=>[e.canonicalUrl,e]));
  const diff = { added:[],updated:[],deleted:[],unchanged:[] };
  for (const [url,entry] of next) {
    const prior=old.get(url);
    diff[!prior ? "added" : prior.contentFingerprint !== entry.contentFingerprint || prior.lastModified !== entry.lastModified ? "updated" : "unchanged"].push(url);
  }
  for (const url of old.keys()) if (!next.has(url)) diff.deleted.push(url);
  for (const urls of Object.values(diff)) urls.sort();
  return diff;
}
