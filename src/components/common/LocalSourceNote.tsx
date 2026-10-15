import s from "@/style/common/content.module.css";
export function LocalSourceNote({ files }: { files: string[] }) {
  if (!files.length) return null;
  return <p className={s.source}>These rules describe the October 12 game build. <a href="/sources#version-notes">Check version differences →</a></p>;
}
