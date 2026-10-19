import { PokemonArt } from "@/components/common/PokemonArt";
import s from "@/style/page/tier-maker.module.css";

// Keep the original animated asset while reducing its transparent framing in compact UI.
export function TierArt({ id, name, size }: { id: number; name: string; size: number }) {
  return <span className={s.artViewport} style={{ width: size, height: size }}><PokemonArt id={id} name={name} size={Math.round(size * 1.6)} /></span>;
}
