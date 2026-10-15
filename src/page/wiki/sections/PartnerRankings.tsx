"use client";
import { PokemonName } from "@/components/common/PokemonName";
import { PokemonArt } from "@/components/common/PokemonArt";
import { useState } from "react";
import type { Pokemon } from "@/types/pokemon";
import s from "@/style/common/content.module.css";
type RankedPartner = Pick<
  Pokemon,
  | "hasDetailPage"
  | "id"
  | "slug"
  | "name"
  | "hp"
  | "speed"
  | "attack"
  | "rarity"
  | "starter"
  | "types"
>;
export default function PartnerRankings({
  partners,
}: {
  partners: RankedPartner[];
}) {
  const [metric, setMetric] = useState<"attack" | "hp" | "speed">("attack"),
    [starters, setStarters] = useState(false);
  const result = partners
    .filter((p) => !starters || p.starter)
    .sort((a, b) => b[metric] - a[metric] || a.id - b.id)
    .slice(0, 30);
  return (
    <>
      <div className={s.toolbar}>
        <label>
          Rank by
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as typeof metric)}
          >
            <option value="attack">Base attack factor</option>
            <option value="hp">Base HP</option>
            <option value="speed">Base movement speed</option>
          </select>
        </label>
        <label>
          Partner pool
          <select
            value={starters ? "starters" : "all"}
            onChange={(e) => setStarters(e.target.value === "starters")}
          >
            <option value="all">All 966 partners</option>
            <option value="starters">29 starters only</option>
          </select>
        </label>
      </div>
      <div className={s.rankGrid}>
        {result.map((p, i) => (
          <article className={s.rankCard} key={p.id}>
            <div className={s.rankNumber}>
              #{String(i + 1).padStart(2, "0")} <span>{p.rarity}★</span>
            </div>
            <div className={s.rankIdentity}>
              <PokemonArt id={p.id} name={p.name} />
              <div>
                <small>#{String(p.id).padStart(3, "0")}</small>
                <h2>
                  <PokemonName pokemon={p} />
                </h2>
                <div>
                  {p.types.map((t) => (
                    <span className="type" data-type={t} key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.rankStats}>
              {(["attack", "hp", "speed"] as const).map((key) => (
                <div data-active={metric === key} key={key}>
                  <span>{key === "attack" ? "ATK" : key.toUpperCase()}</span>
                  <b>{key === "attack" ? `${p[key].toFixed(2)}×` : p[key]}</b>
                </div>
              ))}
            </div>
            <div className={s.rankBar}>
              <span
                style={{ width: `${(p[metric] / result[0][metric]) * 100}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
