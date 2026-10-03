import { teamTotal } from "../game/engine";
import { teamStyle } from "../game/palette";

export function Scoreboard({ teams, activeId }) {
  return (
    <div className="scoreboard">
      {teams.map((team) => (
        <div
          key={team.id}
          className={team.id === activeId ? "score-pill on" : "score-pill"}
          style={teamStyle(team.color)}
        >
          <span>{team.name}</span>
          <b>{teamTotal(team)}</b>
        </div>
      ))}
    </div>
  );
}

export function RoundPips({ total, index }) {
  return (
    <div className="pips" aria-hidden="true">
      {Array.from({ length: total }, (_, pip) => (
        <i key={pip} className={pip === index ? "on" : pip < index ? "done" : ""} />
      ))}
    </div>
  );
}
