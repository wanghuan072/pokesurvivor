import { worldRules as r } from "@/lib/data/game";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/page/game-data.module.css";
export default function WorldReference() {
  const cards = [
    [
      "coin",
      "Golden hour",
      `${r.eventDuration} seconds`,
      "Existing enemies become golden and give double experience. The golden event can also produce extra coins.",
    ],
    [
      "heart",
      "Lost partner",
      `${r.lostSeconds} second limit`,
      "Escort a grounded, non-legendary partner from the lower-rarity pool to its destination. Keep it alive along the way.",
    ],
    [
      "star",
      "Type horde",
      `${r.eventDuration} seconds`,
      "The spawn pool temporarily narrows to one eligible type. Use attack typing and open ground to manage the wave.",
    ],
    [
      "coin",
      "Treasure thief",
      `${r.thiefLife} seconds to escape`,
      "A Meowth carries coins; the rarer Gholdengo variant carries a ×10 ticket. Thieves run away, so decide whether a chase is worth the risk.",
    ],
    [
      "heart",
      "Healing spring",
      "14% max HP / second",
      "Standing close heals while the spring has charge. It recharges over time; it is not an unlimited instant full heal.",
    ],
    [
      "clock",
      "Locked chest",
      `${r.chestSeconds} seconds nearby`,
      "Stay within range to open it while enemies can still attack. Moving away makes opening progress decay.",
    ],
    [
      "fist",
      "Temporary altar",
      `${r.powerSeconds} seconds`,
      "Four possible effects: damage ×2, movement speed ×1.45, pickup radius ×4, or cooldown ×0.6. A used altar switches off.",
    ],
    [
      "shield",
      "Ground traps",
      `${r.trapRadius} world-unit effect radius`,
      "Poison, sticky and explosive variants affect nearby enemies and can also harm or slow your partner. The player danger area is smaller than the full enemy effect radius.",
    ],
  ];
  return (
    <section className={s.reference}>
      <div className={s.heading}>
        <div>
          <small>THE WORLD BETWEEN WAVES</small>
          <h2>Events & interactable objects</h2>
        </div>
      </div>
      <div className={s.worldGrid}>
        {cards.map(([icon, title, timing, description]) => (
          <article key={title}>
            <GameIcon name={icon} />
            <small>{timing}</small>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
