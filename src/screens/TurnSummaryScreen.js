import { Stage } from "../components/Stage";
import { getNextTeam, getTurn, noWordsLeft } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

export function TurnSummaryScreen({ game }) {
  const { match } = game;
  const { team, explainer } = getTurn(match);
  const ending = noWordsLeft(match);
  const lastRound = match.roundIndex >= match.rounds.length - 1;
  const next = getNextTeam(match);
  const round = roundById(match.rounds[match.roundIndex]);
  let label = `Дальше: ${next.name}`;
  if (ending && lastRound) label = "К итогам";
  else if (ending) label = "Завершить раунд";

  return (
    <Stage
      style={teamStyle(team.color)}
      footer={
        <>
          <button type="button" className="btn btn-hat" onClick={game.confirmTurn}>
            {label}
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.requestAbort}>
            Закончить партию
          </button>
        </>
      }
    >
      <p className="kicker">{round.title}</p>
      <h1>
        +{match.turnGuessed.length}
      </h1>
      <p className="lede left">
        {team.name}, объяснял {explainer}.
        {match.turnGuessed.length
          ? " Если слово засчитали зря, верните его в шляпу до передачи хода."
          : " За этот ход очков нет."}
      </p>
      <div className="stack">
        {match.turnGuessed.map((word, index) => (
          <div className="word-row" key={`${word}-${index}`}>
            <span>{word}</span>
            <button type="button" className="text-btn" onClick={() => game.revoke(word)}>
              В шляпу
            </button>
          </div>
        ))}
      </div>
    </Stage>
  );
}
