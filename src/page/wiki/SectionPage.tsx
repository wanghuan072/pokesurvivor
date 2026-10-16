import TierList from "@/page/wiki/sections/TierListContent";
import RankingsContent from "@/page/rankings/RankingsContent";
import Types from "@/page/wiki/sections/TypesContent";
import Gacha from "@/page/wiki/sections/GachaContent";
import Updates from "@/page/wiki/sections/UpdatesContent";
import { PageHeader } from "@/components/common/PageHeader";

import { sections, type Section } from "@/config/sections";

import s from "@/style/common/content.module.css";
import ReferenceContent from "./sections/ReferenceContent";
export default function SectionPage({ section }: { section: Section }) {
  const info = sections[section];
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
      ) : section === "rankings" ? (
        <RankingsContent />
      ) : section === "types" ? (
        <Types />
      ) : section === "gacha" ? (
        <Gacha />
      ) : (
        <Updates />
      )}
    </div>
  );
}
