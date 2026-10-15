import ShinyReference from "@/page/guides/sections/ShinyReference";
import GachaData from "./GachaData";
import s from "@/style/common/content.module.css";
export default function Gacha() {
  return (
    <>
      <article className={`${s.article} prose`}>
        <h2>How the two guarantees work</h2>
        <p>
          A single pull spends one normal ticket. A ten-pull spends ten normal
          tickets or one ×10 ticket. Tickets are earned through play, not
          purchased with real money.
        </p>
        <ol>
          <li>
            <strong>70-pull pity:</strong> each regional banner has a separate
            counter. The counter increments before each roll. If it reaches 70,
            that roll is forced to 5★. Any 5★ resets the counter to zero.
            Starting from 69, the next pull is guaranteed; starting from zero,
            the 70th is guaranteed.
          </li>
          <li>
            <strong>Ten-pull floor:</strong> if the first nine results contain
            no 4★ or 5★, the tenth rolls among those two rarities only. That
            restricted roll uses 6.5:1.5 weights: 81.25% for 4★ and 18.75% for
            5★, unless pity already forces 5★.
          </li>
        </ol>
        <p>
          Ten separate single pulls do not receive the batch guarantee. Within a
          rarity, each eligible partner in that regional pool is equally likely.
          A 5★ guarantee does not promise a particular legendary or species.
        </p>
        <h2>Shinies and duplicates</h2>
        <p>
          The shiny check is 1% when the rolled species has a shiny form. If
          that shiny is already owned, the game tries a missing shiny in the
          same pool and rarity; if none remains, it returns a normal result. A
          non-shiny duplicate refunds the coins listed below.
        </p>
        <p>
          Do not plan coin income around a guaranteed triple refund after
          completing a shiny pool. The game can redirect an owned shiny to a
          missing one or return a normal result when none remain.
        </p>
        <div className={s.chips}>
          <a href="/guides/gacha-and-tickets#shiny">Shiny hunting guide →</a>
          <a href="/pokedex">Find a target partner →</a>
        </div>
      </article>
      <GachaData />
      <ShinyReference />
    </>
  );
}
