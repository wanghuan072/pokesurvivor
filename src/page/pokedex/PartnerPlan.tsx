import profiles from "@/data/game/partner-guides.json";
import { getMoveById } from "@/lib/data/moves";
import { MoveIcon } from "@/components/common/GameIcon";
import s from "@/style/page/game-data.module.css";
export default function PartnerPlan({ id }: { id: number }) {
  const plan = profiles.find((p) => p.id === id);
  if (!plan) return null;
  return (
    <section className={s.reference}>
      <div className={s.heading}>
        <div>
          <small>EDITORIAL PARTNER PLAN</small>
          <h2>{plan.title}</h2>
        </div>
      </div>
      <p>{plan.opening}</p>
      <div className={s.goalGrid}>
        {plan.goals.map((id) => {
          const m = getMoveById(id)!;
          return (
            <a key={id} href={`/level-up#move-${m.slug}`}>
              <MoveIcon id={id} size={36} />
              <strong>{m.name}</strong>
              <small>Lv.5 + {m.requirement}</small>
              <span>→ {m.evolution}</span>
            </a>
          );
        })}
      </div>
      <p>{plan.planning}</p>
    </section>
  );
}
