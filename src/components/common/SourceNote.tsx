import s from "@/style/common/content.module.css";
export function SourceNote({ files }: { files: string[] }) {
  if (!files.length) return null;
  return <p className={s.source}>Found a rule that does not match your game? <a href="mailto:support@pokesurvivor.me">Report a correction →</a></p>;
}
