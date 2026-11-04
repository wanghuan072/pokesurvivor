import { upgrades } from "@/lib/data/wiki";
import c from "@/style/common/content.module.css";

const number = new Intl.NumberFormat("en-US");
const rows = upgrades.map(upgrade => {
  const prices = Array.from({ length: upgrade.max }, (_, level) =>
    Math.round(upgrade.baseCost * upgrade.growth ** level / 10) * 10,
  );
  return { ...upgrade, prices, total: prices.reduce((sum, price) => sum + price, 0) };
});
const total = rows.reduce((sum, row) => sum + row.total, 0);

export default function UpgradeCosts() {
  return <>
    <p>Buying all {rows.length} upgrades to their maximum costs <strong>{number.format(total)} PokéCoins per Pokémon</strong>. This is a full-cost reference, not a recommended spending target. Try a partner’s opening before committing your coins.</p>
    <div className={c.tableWrap} tabIndex={0} role="region" aria-label="Permanent upgrade costs">
      <table className={c.table}>
        <caption>Permanent menu upgrades, separate from the stat cards taken during a run</caption>
        <thead><tr><th scope="col">Upgrade</th><th scope="col">Effect per level</th><th scope="col">Max level</th><th scope="col">Coins to max</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}>
          <th scope="row">{row.name}</th><td className={c.wrapCell}>{row.effect}</td><td>{row.max}</td><td>{number.format(row.total)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <details>
      <summary>Compare the cost of each purchased level</summary>
      <p>Prices are rounded to the nearest ten coins. Read each row from level 1 to its maximum; these are individual purchase prices.</p>
      <div className={c.tableWrap} tabIndex={0} role="region" aria-label="Upgrade prices by level">
        <table className={c.table}>
          <caption>Level 1 → maximum: PokéCoins for each purchase</caption>
          <thead><tr><th scope="col">Upgrade</th><th scope="col">Prices in level order</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id}><th scope="row">{row.name}</th><td className={c.wrapCell}>{row.prices.map(price => number.format(price)).join(" · ")}</td></tr>)}</tbody>
        </table>
      </div>
    </details>
    <p>Upgrades belong to the species you bought them for: investing in Charmander does not upgrade Charizard. Starting move costs 400 coins once per partner; after that, changing to another legal non-buff opening is free. Repertoire adds a random eligible attack, rather than choosing a second move for you.</p>
  </>;
}
