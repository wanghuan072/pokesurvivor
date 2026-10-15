"use client";
import { useState } from "react";
import Image from "next/image";
import s from "@/style/page/game-data.module.css";
type Animation = {
  name: string;
  shiny: boolean;
  src: string;
  still: string;
  frames: number;
  durationMs: number;
};
export default function SpriteGallery({
  name,
  shiny,
  animations,
}: {
  name: string;
  shiny: string | null;
  animations: Animation[];
}) {
  const [variant, setVariant] = useState(false),
    [animate, setAnimate] = useState(false);
  const visible = animations.filter((a) => a.shiny === variant);
  return (
    <section className={s.gallery}>
      <div className={s.heading}>
        <div>
          <small>EXTRACTED GAME ART</small>
          <h2>{name} sprite collection</h2>
        </div>
        <span>CC BY-NC 4.0</span>
      </div>
      <div className={s.controls}>
        <button aria-pressed={!variant} onClick={() => setVariant(false)}>
          Normal
        </button>
        <button
          disabled={!shiny}
          aria-pressed={variant}
          onClick={() => setVariant(true)}
        >
          ✦ Shiny
        </button>
        <label>
          <input
            type="checkbox"
            checked={animate}
            onChange={(e) => setAnimate(e.target.checked)}
          />{" "}
          Play animations
        </label>
      </div>
      <p>
        Compare the game’s actual sprite variants and actions. Animation
        playback is off until you choose it.
      </p>
      <div className={s.animationGrid}>
        {visible.map((a) => (
          <figure key={a.name}>
            <div>
              <Image
                src={animate ? a.src : a.still}
                width={96}
                height={96}
                alt={`${variant ? "Shiny " : ""}${name} ${a.name}${animate ? " animation" : " still frame"}`}
                unoptimized
              />
            </div>
            <figcaption>
              {a.name}
              <small>
                {a.frames} frames · {(a.durationMs / 1000).toFixed(2)}s loop
              </small>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={s.caption}>
        Sprites from SpriteCollab, extracted from the supplied game archive.{" "}
        <a href="/credits/spritecollab-artists.md">Artist credits</a> ·{" "}
        <a href="/credits/pokesurvivor-license.txt">License</a>
      </p>
    </section>
  );
}
