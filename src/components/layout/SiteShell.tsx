"use client";
import SiteFooter from "@/components/layout/SiteFooter";
import { CollectionPokemonArt } from "@/components/common/CollectionPokemonArt";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/navigation";
import { NavigationIcon } from "./NavigationIcon";
import type { SearchEntry } from "@/types/search";
import s from "@/style/layout/shell.module.css";
import snapshot from "@/data/wiki/source-snapshot.json";
const topics = [
  ...navigation,
  { label: "Beginner guide", href: "/guides/beginner-guide", icon: "▣" },
];
const groups = [
  { label: "Start here", links: navigation.slice(0, 2) },
  { label: "Plan your run", links: navigation.slice(2, 6) },
  { label: "Keep exploring", links: navigation.slice(6) },
];
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([]);
  const [searchError, setSearchError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menu) return;
    const media = window.matchMedia("(max-width: 1024px)");
    if (!media.matches) return;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => [...(sidebar.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [])]
      .filter(element => element.getClientRects().length);
    (sidebar.current?.querySelector<HTMLElement>('[aria-current]') ?? focusable()[0])?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const targets = focusable(), first = targets[0], last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onResize = () => { if (!media.matches) setMenu(false); };
    document.addEventListener("keydown", trapFocus);
    media.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      media.removeEventListener("change", onResize);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [menu]);
  useEffect(() => {
    if (path === "/play") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setMenu(false);
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
          <span className={s.mobileMark} aria-hidden="true" /> PokeSurvivor
        </a>
        <button
          onClick={() => setMenu(!menu)}
          aria-controls="site-navigation"
          aria-expanded={menu}
          aria-label="Toggle navigation"
        >
          <NavigationIcon name="menu" />
        </button>
      </header>
      {menu && (
        <button
          className={s.backdrop}
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <aside ref={sidebar} id="site-navigation" aria-label="Site navigation" className={`${s.sidebar} ${menu ? s.open : ""}`}>
        <button className={s.sidebarClose} onClick={() => setMenu(false)} aria-label="Close menu">
          <NavigationIcon name="close" />
        </button>
        <a href="/" className={s.brand}>
          <span className={s.mascot} aria-hidden="true" />
          <strong>PokeSurvivor</strong>
          <small>THE PLAYER’S FIELD GUIDE</small>
        </a>
        <button className={s.search} onClick={() => { setMenu(false); setSearch(true); }} aria-label="Search site">
          <NavigationIcon name="search" /><span>Find a page</span><kbd>Ctrl K</kbd>
        </button>
        <nav aria-label="Main navigation">
          {groups.map(group => <div className={s.navGroup} key={group.label}>
            <p className={s.groupLabel}>{group.label}<span aria-hidden="true" /></p>
            {group.links.map(link => {
              const active = path === link.href || (link.href !== "/" && path.startsWith(link.href + "/"));
              return <a href={link.href} key={link.href} data-symbol={link.symbol}
                className={`${s.navLink} ${active ? s.active : ""}`}
                aria-current={active ? (path === link.href ? "page" : "location") : undefined}>
                <span className={s.navIcon} aria-hidden="true"><CollectionPokemonArt {...link.pokemon} size={56} /></span>
                <span className={s.navLabel}>{link.label}{link.href === "/play" && <small>Free browser game</small>}</span>
                <span className={s.navArrow}><NavigationIcon name="arrow" /></span>
              </a>;
            })}
          </div>)}
        </nav>
        <div className={s.sidebarArt} aria-hidden="true">
          <CollectionPokemonArt id={133} name="Eevee" size={72} />
          <div><small>NEXT RUN</small><span>A new partner.<br />A new plan.</span></div>
        </div>
        <p className={s.disclaimer}>
          Independent fan guide.<br />Not affiliated with the official game.
        </p>
        <a className={s.love} href="/legal/about-us"><span>Built by fans, for fans.</span> <span aria-hidden="true">↗</span></a>
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
              <a href={r.href} key={r.href} onClick={() => setSearch(false)}>
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
            <a href="/level-up#move-cards">ϟ Browse all {snapshot.counts.moves} moves →</a>
          </div>
          <small>Esc to close · Choose a topic to explore</small>
        </div>
      </dialog>
    </div>
  );
}
