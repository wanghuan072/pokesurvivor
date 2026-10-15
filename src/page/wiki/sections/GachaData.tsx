import { gacha } from "@/lib/data/wiki";
import { SourceNote } from "@/components/common/SourceNote";
import s from "@/style/common/content.module.css";
export default function GachaData() {
  return (
    <>
      <h2 className={s.sectionTitle}>Base rates & duplicate rewards</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>RARITY</th>
              <th>BASE RATE</th>
              <th>DUPLICATE COINS</th>
            </tr>
          </thead>
          <tbody>
            {gacha.rates.map((r) => (
              <tr key={r.rarity}>
                <td>{r.rarity}★</td>
                <td>{r.percent}%</td>
                <td>
                  {gacha.refund[String(r.rarity) as keyof typeof gacha.refund]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className={s.sectionTitle}>Nine regional banner pools</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>BANNER</th>
              {[1, 2, 3, 4, 5].map((r) => (
                <th key={r}>{r}★</th>
              ))}
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {gacha.banners.map((b) => (
              <tr key={b.region}>
                <td>{b.region[0].toUpperCase() + b.region.slice(1)}</td>
                {b.counts.map((count, i) => (
                  <td key={i}>{count}</td>
                ))}
                <td>{b.counts.reduce((a, b) => a + b, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SourceNote files={["js/systems/gacha.js", "js/data/pokedex.js"]} />
    </>
  );
}
