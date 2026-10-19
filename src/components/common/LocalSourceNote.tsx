import { SourceNote } from "./SourceNote";
export function LocalSourceNote({ files }: { files: string[] }) {
  return <SourceNote files={files} />;
}
