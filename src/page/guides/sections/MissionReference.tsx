import { missions } from "@/lib/data/game";
import { GameIcon } from "@/components/common/GameIcon";
import s from "@/style/page/game-data.module.css";
const units: Record<string, string> = {
  survive: "minutes",
  wsurvive: "minutes",
  playType: "minutes",
  level: "level",
  coins: "coins",
  kill: "defeats",
  killType: "defeats",
  wkill: "defeats",
  boss: "bosses",
  wboss: "bosses",
  chest: "chests",
  item: "items",
  evolve: "evolutions",
  wevolve: "evolutions",
  wrift: "Rift wins",
  wdaily: "daily claims",
};
export default function MissionReference() {
  return (
    <section className={s.reference}>
      {["daily", "weekly"].map((period) => (
        <div key={period}>
          <div className={s.heading}>
            <div>
              <small>
                {period === "daily" ? "3 ACTIVE PER DAY" : "2 ACTIVE PER WEEK"}
              </small>
              <h2>
                {period === "daily"
                  ? "Daily mission pool"
                  : "Weekly mission pool"}
              </h2>
            </div>
            <span>
              {missions.filter((m) => m.period === period).length} TEMPLATES
            </span>
          </div>
          <div className={s.missionGrid}>
            {missions
              .filter((m) => m.period === period)
              .map((m) => (
                <article key={m.id}>
                  <GameIcon name={m.period === "weekly" ? "star" : "book"} />
                  <small>
                    {m.typeSpecific
                      ? "TYPE-SPECIFIC OBJECTIVE"
                      : m.mode === "max"
                        ? "BEST SINGLE RUN"
                        : "ACCUMULATED PROGRESS"}
                  </small>
                  <h3>{m.name}</h3>
                  <p>
                    Possible target:{" "}
                    <b>
                      {m.goals.join(" / ")} {units[m.id] || "completions"}
                    </b>
                    .
                  </p>
                  <footer>
                    {Object.entries(m.reward).map(([key, value]) => (
                      <span key={key}>
                        <GameIcon
                          name={
                            key === "coins"
                              ? "coin"
                              : key === "t10"
                                ? "ticket10"
                                : "ticket"
                          }
                          size={18}
                        />
                        {value}{" "}
                        {key === "t10"
                          ? "×10 ticket"
                          : key === "t1"
                            ? "tickets"
                            : "coins"}
                      </span>
                    ))}
                  </footer>
                </article>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
