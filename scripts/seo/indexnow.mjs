import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, PROJECT_ID, REPOSITORY } from "./config.mjs";
import { assertManifest, pendingDeletionUrls } from "./manifest-contract.mjs";
import { manifestDiff, MANIFEST_PATH } from "./manifest.mjs";

export const RECEIPT_PREFIX = `indexnow-${PROJECT_ID}-production`;
const WORKFLOW = ".github/workflows/indexnow.yml";
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const request = (url, options = {}, fetcher = fetch) => fetcher(url, {
  ...options, redirect: "manual", signal: AbortSignal.timeout(20000), cache: "no-store",
});

export async function boundedText(response, limit = 32 * 1024 * 1024) {
  if (Number(response.headers.get("content-length")) > limit) throw new Error("Response exceeds size limit");
  const reader = response.body?.getReader();
  if (!reader) return "";
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Response exceeds size limit");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks).toString("utf8");
}

// sender/repository are supplied by GitHub, not by client_payload.
export function deploymentInput(eventName, event) {
  if (event.repository?.full_name !== REPOSITORY) return null;
  if (eventName === "workflow_dispatch") return {}; // Retry the currently published site.
  if (eventName !== "repository_dispatch" || event.sender?.login !== "vercel[bot]" || event.sender?.type !== "Bot") return null;
  if (!["vercel.deployment.success", "vercel.deployment.promoted"].includes(event.action)) return null;
  const p = event.client_payload;
  if (p?.project?.id !== PROJECT_ID || p.environment !== "production" || !["success", "promoted"].includes(p.state?.type)) return null;
  if (!/^dpl_[A-Za-z0-9]+$/.test(p.id) || !/^[a-f0-9]{40}$/.test(p.git?.sha ?? "")) throw new Error("Invalid deployment event");
  const url = new URL(p.url);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app") || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) throw new Error("Invalid deployment URL");
  return { id: p.id, sha: p.git.sha };
}

export async function publishedSite(fetcher = fetch) {
  const response = await request(SITE_URL + MANIFEST_PATH, {}, fetcher);
  if (response.status !== 200 || !response.headers.get("content-type")?.includes("application/json")) throw new Error("Published SEO Manifest is unavailable; deploy the code first");
  const manifest = JSON.parse(await boundedText(response));
  assertManifest(manifest);
  if (manifest.siteUrl !== SITE_URL || manifest.projectId !== PROJECT_ID || manifest.environment !== "production" || !/^[a-f0-9]{40}$/.test(manifest.gitSha ?? "")) throw new Error("Manifest does not belong to this production project");
  if (!/^dpl_[A-Za-z0-9]+$/.test(manifest.deploymentId ?? "")) throw new Error("Published Manifest has no deployment identity");
  return { id: manifest.deploymentId, manifest };
}

export function hasCanonical(html, expected) {
  const tags=(html.match(/<link\b[^>]*>/gi)??[]).filter(tag=>/\brel=["']canonical["']/i.test(tag));
  if(tags.length!==1)return false;
  const href=tags[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
  try { return new URL(href).href===new URL(expected).href; } catch { return false; }
}

export function submissionUrls(previous, current) {
  const diff = manifestDiff(previous, current);
  const eligible = new Set(current.entries.filter(e => e.indexable).map(e => e.canonicalUrl));
  diff.deleted = [...new Set([...diff.deleted, ...pendingDeletionUrls(previous, current)])].filter(url => !eligible.has(url)).sort();
  const urls = [...new Set([...diff.added, ...diff.updated, ...diff.deleted])].sort();
  for (const value of urls) {
    const url = new URL(value);
    if (url.origin !== SITE_URL || url.username || url.password || url.search || url.hash) throw new Error("Invalid IndexNow URL");
  }
  return { diff, urls };
}

export async function submitBatches(urls, key, { fetcher = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error("Invalid IndexNow key");
  for (const url of urls) if (new URL(url).origin !== SITE_URL) throw new Error("IndexNow URL host mismatch");
  let batches = 0;
  for (let i = 0; i < urls.length; i += 10000) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await request("https://api.indexnow.org/indexnow", {
        method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: new URL(SITE_URL).hostname, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: urls.slice(i, i + 10000) }),
      }, fetcher);
      const status = response.status;
      await response.body?.cancel();
      if (status === 200 || status === 202) { batches++; break; }
      if (status === 429 && attempt < 3) { await sleep(1000 * 2 ** attempt); continue; }
      throw new Error(`IndexNow batch ${batches + 1}: HTTP ${status}. Last successful receipt retained; rerun the workflow to retry.`);
    }
  }
  return batches;
}

// Immutable Actions artifacts replace the database; the workflow serializes all notifications.
export async function latestReceipt(token, fetcher = fetch) {
  if (!token) throw new Error("The workflow must supply its built-in GitHub token");
  async function github(route) {
    const response = await request(`https://api.github.com/repos/${REPOSITORY}${route}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    }, fetcher);
    if (response.status !== 200) throw new Error(`Cannot read notification history: HTTP ${response.status}`);
    return JSON.parse(await boundedText(response));
  }
  const candidates = [];
  for (let page = 1; ; page++) {
    const { artifacts } = await github(`/actions/artifacts?per_page=100&page=${page}`);
    candidates.push(...artifacts.filter(a => !a.expired && a.name.startsWith(RECEIPT_PREFIX + "-")));
    if (artifacts.length < 100) break;
  }
  candidates.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id);
  for (const artifact of candidates) {
    const suffix = artifact.name.slice(RECEIPT_PREFIX.length + 1);
    if (!/^\d+-\d+$/.test(suffix)) continue;
    const [runId, attempt] = suffix.split("-");
    if (String(artifact.workflow_run?.id) !== runId) continue;
    const run = await github(`/actions/runs/${runId}/attempts/${attempt}`);
    if (run.path !== WORKFLOW || run.head_branch !== "main" || run.status !== "completed" || run.conclusion !== "success" || !["repository_dispatch", "workflow_dispatch"].includes(run.event)) continue;
    return { name: artifact.name, runId };
  }
  return null;
}

export async function deliver({ current, previous = null, fetcher = fetch }) {
  const live = await publishedSite(fetcher);
  if (live.id !== current.id || JSON.stringify(live.manifest) !== JSON.stringify(current.manifest)) return { skipped: "Production changed; a newer deployment will be handled separately" };
  const manifest = live.manifest;
  if (!manifest.entries.some(e => e.indexable)) return { skipped: "Production indexing is disabled" };
  if (previous && (previous.projectId !== PROJECT_ID || previous.environment !== "production")) throw new Error("Notification receipt belongs to another project");
  const { diff, urls } = submissionUrls(previous?.manifest, manifest);
  if (previous?.deploymentId === live.id && urls.length === 0) return { skipped: "This deployment was already notified" };
  const key = read("src/data/seo/indexnow.json").key;
  const keyResponse = await request(`${SITE_URL}/${key}.txt`, {}, fetcher);
  if (keyResponse.status !== 200 || (await boundedText(keyResponse, 1024)).trim() !== key) throw new Error("Published IndexNow verification file is missing or incorrect");
  for (const url of urls) {
    const response = await request(url, {}, fetcher);
    const deleted = diff.deleted.includes(url);
    if (deleted && [301, 308, 404, 410].includes(response.status)) {
      if ([301, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || new URL(location, url).origin !== SITE_URL || new URL(location, url).href === url) throw new Error("Invalid retired URL redirect");
      }
      await response.body?.cancel();
      continue;
    }
    if (response.status !== 200) throw new Error(`Published URL unavailable: ${new URL(url).pathname}`);
    const html = await boundedText(response);
    const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html) || /noindex/i.test(response.headers.get("x-robots-tag") ?? "");
    const intentionallyHidden = manifest.entries.some(e => e.canonicalUrl === url && !e.indexable);
    if (deleted ? !(intentionallyHidden && noindex) : noindex || !hasCanonical(html,url)) throw new Error(`URL does not match its indexing policy: ${new URL(url).pathname}`);
  }
  const ready = await publishedSite(fetcher);
  if (JSON.stringify(ready) !== JSON.stringify(live)) return { skipped: "Production changed before notification" };
  const acceptedBatches = await submitBatches(urls, key, { fetcher });
  const confirmed = await publishedSite(fetcher);
  if (JSON.stringify(confirmed) !== JSON.stringify(live)) return { skipped: "Production changed; previous receipt retained for retry" };
  return {
    added: diff.added.length, updated: diff.updated.length, deleted: diff.deleted.length, unchanged: diff.unchanged.length, acceptedBatches,
    receipt: { projectId: PROJECT_ID, environment: "production", deploymentId: live.id, manifest },
  };
}

function outputs(values) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(values).map(([k, v]) => `${k}=${v ?? ""}\n`).join(""));
}
export async function prepare({ env = process.env, fetcher = fetch } = {}) {
  const event = read(env.GITHUB_EVENT_PATH);
  const input = deploymentInput(env.GITHUB_EVENT_NAME, event);
  if (!input) return { eligible: false };
  const current = await publishedSite(fetcher);
  if (input.id && (current.id !== input.id || current.manifest.gitSha !== input.sha)) return { eligible: false };
  if (!current.manifest.entries.some(e => e.indexable)) return { eligible: false };
  const prior = await latestReceipt(env.GH_TOKEN, fetcher);
  if (!prior) console.log("No retained successful receipt: notify all current URLs and known deletions once.");
  if (!/^\d+$/.test(env.GITHUB_RUN_ID ?? "") || !/^\d+$/.test(env.GITHUB_RUN_ATTEMPT ?? "")) throw new Error("Invalid workflow run identity");
  fs.mkdirSync(env.INDEXNOW_DIR, { recursive: true });
  fs.writeFileSync(path.join(env.INDEXNOW_DIR, "current.json"), JSON.stringify(current));
  return { eligible: true, previous_artifact: prior?.name, previous_run: prior?.runId, receipt_name: `${RECEIPT_PREFIX}-${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT}` };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "prepare") {
    const result = await prepare(); outputs(result);
    console.log(result.eligible ? "Published production version confirmed. No custom credentials required." : "Skipped unrelated, preview or superseded deployment.");
  } else if (process.argv[2] === "submit") {
    const dir = process.env.INDEXNOW_DIR;
    const previous = path.join(dir, "previous/receipt.json");
    const { receipt, ...summary } = await deliver({ current: read(path.join(dir, "current.json")), previous: fs.existsSync(previous) ? read(previous) : null });
    if (receipt) fs.writeFileSync(path.join(dir, "receipt.json"), JSON.stringify(receipt));
    outputs({ save: !!receipt });
    console.log(JSON.stringify(summary));
  } else throw new Error("Use prepare or submit (the deployment workflow supplies its context)");
}
