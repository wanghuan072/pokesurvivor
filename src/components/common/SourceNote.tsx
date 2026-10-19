import s from "@/style/common/content.module.css";
import mechanics from "@/data/game/mechanics.json";
export function SourceNote({ files }: { files: string[] }) {
  if (!files.length) return null;
  return <p className={s.source}>Rules checked <time dateTime={mechanics.reviewed}>{mechanics.reviewed}</time> · Game {mechanics.build}. <a href="mailto:support@pokesurvivor.me">Report a correction →</a></p>;
}
