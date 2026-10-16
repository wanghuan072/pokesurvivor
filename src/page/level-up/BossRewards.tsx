import rewards from "@/data/game/boss-rewards.json";
import { items } from "@/lib/data/wiki";
import { GameIcon, MoveIcon } from "@/components/common/GameIcon";
import s from "@/style/page/level-up.module.css";

const equipment = rewards.heldItemIds.map(id => items.find(item => item.id === id)!);

export default function BossRewards() {
  return (
    <section id="boss-rewards" className={s.section} aria-labelledby="boss-rewards-title">
      <div className={s.sectionHead}>
        <div><small>AFTER THE BOSS FIGHT</small><h2 id="boss-rewards-title">Boss rewards & special effects</h2></div>
        <span>{equipment.length} ITEMS · BOND FUSION</span>
      </div>
      <p className={s.intro}>A Boss reward can change your build without teaching you a new move. Keep equipment, Rift Bonds and the Boss’s own attacks separate when planning your next upgrade.</p>
      <div className={s.rewardOverview}>
        <article className={s.choice}>
          <GameIcon name="trophy" size={24} />
          <h3>Standard map Boss</h3>
          <p>Drops a held item alongside other loot. Equip it for its run effect; it does not grant a new move or a Bond.</p>
          <a href="#boss-items">Compare all {equipment.length} held items →</a>
        </article>
        <article className={s.choice}>
          <GameIcon name="bond" size={24} />
          <h3>Rift legendary</h3>
          <p>Drops a held item and grants one Bond on victory. Use the Bond after returning to the map to combine moves you already know.</p>
          <a href="#bond-fusion">See how fusion works →</a>
        </article>
      </div>
      <section id="bond-fusion" className={s.section} aria-labelledby="bond-title">
        <div className={s.sectionHead}>
          <div><small>ONE SLOT, MORE MOVES</small><h2 id="bond-title">Bonds from Rift victories</h2></div>
          <span>UP TO {rewards.bond.maxGroupSize} MOVES / GROUP</span>
        </div>
        <ol className={s.bondSteps}>
          {rewards.bond.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.description}</p></li>)}
        </ol>
        <div className={s.bondExample}>
          <div><MoveIcon id="ember" size={24} /><span>Ember</span></div>
          <b aria-hidden="true">+</b>
          <div><MoveIcon id="fire-spin" size={24} /><span>Fire Spin</span></div>
          <b aria-hidden="true">→</b>
          <div><GameIcon name="bond" size={24} /><span>One active slot<small>Two learned moves, independent cooldowns</small></span></div>
        </div>
        <p className={s.intro}>For example, learn Ember and Fire Spin on a compatible partner, then spend a Bond to group them. This frees one ordinary slot. Their levels and evolution state stay intact; a Bond does not turn either move into its evolution.</p>
        <details className={s.bondNotes}>
          <summary>Unused Bonds, full groups and Choice Band</summary>
          <ul>{rewards.bond.notes.map(note => <li key={note}>{note}</li>)}</ul>
        </details>
      </section>
      <section id="boss-items" className={s.section} aria-labelledby="boss-items-title">
        <div className={s.sectionHead}>
          <div><small>EQUIPMENT, NOT MOVE CARDS</small><h2 id="boss-items-title">All Boss-drop held items</h2></div>
          <span>{equipment.length} EFFECTS · EQUIP ONE</span>
        </div>
        <p className={s.intro}>{rewards.equipment.description}</p>
        <div className={s.statGrid}>
          {equipment.map(item => (
            <article className={s.statCard} key={item.id} id={`item-${item.id}`}>
              <div className={s.statArtwork}><GameIcon name={item.id} size={24} /><small>HELD ITEM</small></div>
              <div className={s.statBody}>
                <div className={s.statHeader}><h3>{item.name}</h3><span className={s.cap}>CURRENT RUN</span></div>
                <p>{item.description}{" "}{(rewards.itemNotes as Record<string, string>)[item.id]}</p>
                <footer>Boss drop or chest · One held item at a time</footer>
              </div>
            </article>
          ))}
        </div>
        <p className={s.note}>{rewards.equipment.exclusions} An item with an attack, regeneration or speed bonus does not count as an evolution’s required stat card.</p>
      </section>
      <section id="boss-patterns" className={s.section} aria-labelledby="boss-patterns-title">
        <div className={s.sectionHead}>
          <div><small>ENEMY ATTACKS · NOT LEARNABLE</small><h2 id="boss-patterns-title">Recognize the Boss’s special attacks</h2></div>
          <span>{rewards.patterns.length} SHARED PATTERNS</span>
        </div>
        <p className={s.intro}>Each Boss uses four patterns: an area slam, either a charge or a leap, and two ranged patterns. The seven families below are shared across Bosses; they are not seven extra cards or attacks awarded after a win. Bosses enrage below half HP, which can shorten warnings or add projectiles.</p>
        <details className={s.bondNotes}>
          <summary>Compare all seven patterns and their enraged variants</summary>
          <div className={s.statGrid}>
            {rewards.patterns.map(pattern => <article className={s.statCard} key={pattern.id}>
              <div className={s.statArtwork}><GameIcon name={pattern.icon} size={24} /><small>ENEMY ONLY</small></div>
              <div className={s.statBody}>
                <div className={s.statHeader}><h3>{pattern.name}</h3></div>
                <p>{pattern.description}</p>
                <footer>{pattern.normal} → {pattern.enraged}</footer>
              </div>
            </article>)}
          </div>
        </details>
      </section>
      <p className={s.note}>Gold evolution cards still require a level-5 move and its run stat card. Temporary altar powers are another map reward, separate from Boss loot; <a href="/guides/beginner-guide#world">check world events and altars →</a></p>
    </section>
  );
}
