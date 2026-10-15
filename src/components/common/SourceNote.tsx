import s from "@/style/common/content.module.css";
export function SourceNote({ files }: { files: string[] }) {
  if (!files.length) return null;
  return <p className={s.source}><a href="/sources">Game version, checks and corrections →</a></p>;
}
