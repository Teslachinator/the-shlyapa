import { Scoreboard, RoundPips } from "../components/Scoreboard";
import { Stage } from "../components/Stage";
import { getTurn } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

export function ReadyScreen({ game }) {
  const { match } = game;
  const round = roundById(match.rounds[match.roundIndex]);
  const { team, explainer } = getTurn(match);
  const inHat = match.hat.length + match.passed.length;
  const opening = match.turnsPlayed === 0 && match.roundIndex === 0;

  return (
    <Stage
      className="ready"
      style={teamStyle(team.color)}
      footer={
        <>
          <button type="button" className="btn btn-hat" onClick={game.begin}>
            Показать слово
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.requestAbort}>
            Закончить партию
          </button>
        </>
      }
    >
      <RoundPips total={match.rounds.length} index={match.roundIndex} />
      <p className="kicker">
        {match.rounds.length > 1
          ? `Раунд ${match.roundIndex + 1} из ${match.rounds.length}`
          : "Раунд"}
      </p>
      <h1>{round.lead}</h1>
      <div className="rule-hint">
        <p>{round.rules}</p>
      </div>
      <Scoreboard teams={match.teams} activeId={team.id} />
      <div className="turn-call">
        <p className="kicker">Сейчас</p>
        <p className="who">{team.name}</p>
        <p className="lede">
          Объясняет {explainer}. В шляпе {inHat}.
        </p>
        <p className="lede">
          {opening
            ? "Экран видит только тот, кто объясняет. Слова одни и те же во всех раундах."
            : "Передайте телефон объясняющему и не подглядывайте."}
        </p>
      </div>
    </Stage>
  );
}
