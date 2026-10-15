"use client";
import { useState } from "react";
import type { PokemonSummary } from "@/types/pokemon";
import { PokemonArt } from "@/components/common/PokemonArt";
import s from "@/style/common/content.module.css";
export default function PokedexBrowser({
  pokemon,
}: {
  pokemon: PokemonSummary[];
}) {
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [region, setRegion] = useState(""),
    [group, setGroup] = useState(""),
    [page, setPage] = useState(1);
  const [sort, setSort] = useState("id");
  const [shiny, setShiny] = useState(false);
  const types = [...new Set(pokemon.flatMap((p) => p.types))].sort(),
    regions = [...new Set(pokemon.map((p) => p.region))];
  const result = pokemon
    .filter(
      (p) =>
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
          String(p.id) === query.replace("#", "")) &&
        (!type || p.types.includes(type)) &&
        (!region || p.region === region) &&
        (!group ||
          (group === "guide"
            ? p.hasDetailPage
            : group === "starter"
              ? p.starter
              : p.legendary)),
    )
    .sort((a, b) =>
      sort === "id"
        ? a.id - b.id
        : b[sort as "hp" | "speed" | "attack" | "rarity"] -
            a[sort as "hp" | "speed" | "attack" | "rarity"] || a.id - b.id,
    );
  const pages = Math.max(1, Math.ceil(result.length / 48)),
    activePage = Math.min(page, pages);
  return (
    <>
      <div className={s.toolbar}>
        <label>
          Sort by
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="id">Pokédex number</option>
            <option value="attack">Highest attack factor</option>
            <option value="hp">Highest HP</option>
            <option value="speed">Highest speed</option>
            <option value="rarity">Highest rarity</option>
          </select>
        </label>
        <label>
          Search Pokémon
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Name or Pokédex number…"
            type="search"
          />
        </label>
        <label>
          Type
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Region
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r[0].toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Collection
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Pokémon</option>
            {pokemon.some((p) => p.hasDetailPage) && (
              <option value="guide">Published field guides</option>
            )}
            <option value="starter">Starters</option>
            <option value="legendary">Legendary Pokémon</option>
          </select>
        </label>
        <label>
          Sprite appearance
          <select
            value={shiny ? "shiny" : "normal"}
            onChange={(e) => setShiny(e.target.value === "shiny")}
          >
            <option value="normal">Normal sprites</option>
            <option value="shiny">Shiny sprites</option>
          </select>
        </label>
        <button
          onClick={() => {
            setQuery("");
            setType("");
            setRegion("");
            setGroup("");
            setSort("id");
            setShiny(false);
            setPage(1);
          }}
        >
          Reset
        </button>
      </div>
      <p className={s.count} aria-live="polite">
        {result.length} Pokémon found · Page {activePage} of {pages}
      </p>
      <div className={s.dexGrid}>
        {result.slice((activePage - 1) * 48, activePage * 48).map((p) => {
          const Tag = p.hasDetailPage ? "a" : "article";
          return (
            <Tag
              href={p.hasDetailPage ? `/pokedex/${p.slug}` : undefined}
              key={p.id}
              className={s.dexCard}
              data-guide={p.hasDetailPage}
            >
              <div className={s.dexTop}>
                <small>#{String(p.id).padStart(3, "0")}</small>
                <span>{"★".repeat(p.rarity)}</span>
              </div>
              <PokemonArt id={p.id} name={p.name} shiny={shiny && p.hasShiny} />
              <h2>{p.name}</h2>
              <div className={s.dexStats}>
                <span>
                  HP <b>{p.hp}</b>
                </span>
                <span>
                  ATK <b>{p.attack.toFixed(2)}×</b>
                </span>
                <span>
                  SPD <b>{p.speed}</b>
                </span>
              </div>
              <div>
                {p.types.map((t) => (
                  <span className="type" data-type={t} key={t}>
                    {t}
                  </span>
                ))}
              </div>
              {shiny && !p.hasShiny && <em>NORMAL ART ONLY</em>}
              {p.hovering && <em>HOVERING</em>}
              {p.starter && <em>STARTER PARTNER</em>}
              {p.legendary && <em>LEGENDARY</em>}
              <span className={s.dexStatus}>
                {p.hasDetailPage ? "FIELD GUIDE →" : "ROSTER DATA"}
              </span>
            </Tag>
          );
        })}
        {!result.length && (
          <p className={s.empty}>
            No Pokémon match these filters. Try another name or reset the
            filters.
          </p>
        )}
      </div>
      <div className={s.pagination}>
        <button
          disabled={activePage === 1}
          onClick={() => setPage(activePage - 1)}
        >
          ← Previous
        </button>
        <span>
          {activePage} / {pages}
        </span>
        <button
          disabled={activePage === pages}
          onClick={() => setPage(activePage + 1)}
        >
          Next →
        </button>
      </div>
    </>
  );
}
