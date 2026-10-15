import TierList from "@/page/wiki/sections/TierListContent";
import Builds from "@/page/builds/BuildsContent";
import Types from "@/page/wiki/sections/TypesContent";
import Gacha from "@/page/wiki/sections/GachaContent";
import Updates from "@/page/wiki/sections/UpdatesContent";
import EditorialPolicy from "@/page/legal/EditorialPolicy";
import { PageHeader } from "@/components/common/PageHeader";

import { sections, type Section } from "@/config/sections";

import s from "@/style/common/content.module.css";
import ReferenceContent from "./sections/ReferenceContent";
export default function SectionPage({ section }: { section: Section }) {
  const info = sections[section];
  if (section === "builds") return <Builds />;
  return (
    <div className={s.wrap}>
      <PageHeader
        title={info.title}
        description={info.description}
        path={"/" + section}
      />
      {section === "achievements" ? (
        <ReferenceContent />
      ) : section === "tier-list" ? (
        <TierList />
      ) : section === "types" ? (
        <Types />
      ) : section === "gacha" ? (
        <Gacha />
      ) : section === "updates" ? (
        <Updates />
      ) : (
        <EditorialPolicy />
      )}
    </div>
  );
}
