"use client";
import SiteFooter from "@/components/layout/SiteFooter";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/navigation";
import type { SearchEntry } from "@/types/search";
import s from "@/style/layout/shell.module.css";
const topics = [
  ...navigation,
  { label: "Beginner guide", href: "/guides/beginner-guide", icon: "▣" },
  { label: "Charizard build", href: "/builds#build-charizard", icon: "♨" },
];
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([]);
  const [searchError, setSearchError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (path === "/play") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [path]);
  useEffect(() => {
    if (search) dialog.current?.showModal();
    else dialog.current?.close();
  }, [search]);
  useEffect(() => {
    if (!search || searchIndex.length) return;
    const controller = new AbortController();
    fetch("/search-index.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Search unavailable");
        return response.json();
      })
      .then((entries: SearchEntry[]) => {
        setSearchIndex(entries);
        setSearchError(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setSearchError(true);
      });
    return () => controller.abort();
  }, [search, searchIndex.length]);
  if (path === "/play") return <>{children}<SiteFooter /></>;
  const term = query.trim().toLowerCase();
  const candidates = [
    ...topics.map((t) => ({ ...t, keywords: "" })),
    ...(term ? searchIndex : []),
  ].filter((x) => `${x.label} ${x.keywords}`.toLowerCase().includes(term));
  const results = [
    ...new Map(candidates.map((x) => [x.href, x])).values(),
  ].slice(0, 16);
  return (
    <div className={s.shell}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={s.mobile}>
        <a href="/">
          ◓ PokeSurvivor <em>.me</em>
        </a>
        <button
          onClick={() => setMenu(!menu)}
          aria-controls="site-navigation"
          aria-expanded={menu}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </header>
      {menu && (
        <button
          className={s.backdrop}
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <aside id="site-navigation" className={`${s.sidebar} ${menu ? s.open : ""}`}>
        <a href="/" className={s.brand}>
          <span className={s.mascot} />
          <strong>PokeSurvivor</strong>
          <b>.me</b>
        </a>
        <button className={s.search} onClick={() => setSearch(true)}>
          <span>⌕</span> Search... <kbd>Ctrl K</kbd>
        </button>
        <nav aria-label="Main navigation">
          {navigation.map((n) => (
            <a
              href={n.href}
              key={n.href}
              className={
                path === n.href ||
                (n.href !== "/" && path.startsWith(n.href + "/"))
                  ? s.active
                  : ""
              }
              aria-current={path === n.href ? "page" : undefined}
            >
              <span>{n.icon}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className={s.sidebarArt} />
        <blockquote>
          “Pick a partner.
          <br />
          Give the next run a plan.”<cite>— PokeSurvivor.me</cite>
        </blockquote>
        <p className={s.disclaimer}>
          An unofficial fan guide.
          <br />
          Not affiliated with Nintendo,
          <br />
          The Pokémon Company or
          <br />
          the game’s creator.
        </p>
        <small className={s.love}>
          ♥ <span>Built by fans, for fans.</span>
        </small>
      </aside>
      <div className={s.content}>
        <main id="main">{children}</main>
        <SiteFooter />
      </div>
      <dialog
        aria-labelledby="search-dialog-title"
        ref={dialog}
        className={s.dialog}
        onCancel={() => setSearch(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSearch(false);
        }}
      >
        <div>
          <div className={s.dialogHead}>
            <h2 id="search-dialog-title">Find a page</h2>
            <button aria-label="Close search" onClick={() => setSearch(false)}>
              ✕
            </button>
          </div>
          <input
            autoFocus
            aria-label="Search PokeSurvivor.me"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a guide, Pokémon or move…"
          />
          <div className={s.results}>
            {searchError && (
              <p>
                Full search could not load. Browse the Pokédex or moves below.
              </p>
            )}
            {results.map((r) => (
              <a href={r.href} key={r.href}>
                {r.icon} {r.label}
                <span>→</span>
              </a>
            ))}
            {!results.length && (
              <p>
                No matching topics. <a href="/pokedex">Search all Pokémon →</a>
              </p>
            )}
            <a href="/pokedex">◓ Browse all 966 Pokémon →</a>
            <a href="/level-up#move-cards">ϟ Browse all 64 moves →</a>
          </div>
          <small>Esc to close · Choose a topic to explore</small>
        </div>
      </dialog>
    </div>
  );
}
