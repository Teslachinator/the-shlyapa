import { Scoreboard, RoundPips } from "../components/Scoreboard";
import { Stage } from "../components/Stage";
import { getTurn } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

function wordCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "слово";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "слова";
  return "слов";
}

export function ReadyScreen({ game }) {
  const { match } = game;
  const round = roundById(match.rounds[match.roundIndex]);
  const { team, explainer } = getTurn(match);
  const inHat = match.hat.length + match.passed.length;
  const hatTotal = match.deck.length;
  const opening = match.turnsPlayed === 0 && match.roundIndex === 0;

  return (
    <Stage
      className="ready"
      style={teamStyle(team.color)}
      corner={
        <button type="button" className="text-btn" onClick={game.requestAbort}>
          Закончить партию
        </button>
      }
      footer={
        <button type="button" className="btn btn-hat" onClick={game.begin}>
          Показать слово
        </button>
      }
    >
      <div className="between-round">
        <RoundPips total={match.rounds.length} index={match.roundIndex} />
        <p className="kicker">
          {match.rounds.length > 1
            ? `Раунд ${match.roundIndex + 1} из ${match.rounds.length}`
            : "Раунд"}
        </p>
        <h2>{round.lead}</h2>
      </div>
      <p className="kicker">Команда</p>
      <h1 className="between-team">{team.name}</h1>
      <p className="kicker">Игрок</p>
      <p className="between-player">{explainer}</p>
      <p className="between-hat">{`В шляпе осталось ${inHat} ${wordCount(inHat)}.`}</p>
      <Scoreboard teams={match.teams} activeId={team.id} />
      <div className="between-notes">
        <div className="rule-hint">
          <p>{round.rules}</p>
        </div>
        <p className="lede">
          {opening
            ? "Экран видит только тот, кто объясняет. Слова одни и те же во всех раундах."
            : "Передайте телефон объясняющему и не подглядывайте."}
        </p>
      </div>
    </Stage>
  );
}
