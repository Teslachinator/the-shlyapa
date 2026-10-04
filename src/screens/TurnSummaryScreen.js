import { WordFlip } from "../components/WordFlip";
import { Stage } from "../components/Stage";
import { getNextTeam, getTurn, noWordsLeft } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

function byRussian(left, right) {
  return left.localeCompare(right, "ru");
}

export function TurnSummaryScreen({ game }) {
  const { match } = game;
  const { team, explainer } = getTurn(match);
  const ending = noWordsLeft(match);
  const next = getNextTeam(match);
  const round = roundById(match.rounds[match.roundIndex]);
  const guessed = new Set(match.turnGuessed);
  const words = [...(match.seen || [])].sort(byRussian);
  const label = ending ? "Завершить раунд" : `Дальше: ${next.name}`;

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
      <h1>+{match.turnGuessed.length}</h1>
      <p className="lede left">
        {team.name}, объяснял {explainer}. Здесь только слова, которые были на экране.
      </p>
      <div className="stack">
        {words.map((word) => {
          const scored = guessed.has(word);
          return (
            <WordFlip
              key={word}
              word={word}
              scored={scored}
              locked={word === match.expired}
              onScore={() => game.award(word)}
              onHat={() => game.revoke(word)}
            />
          );
        })}
      </div>
    </Stage>
  );
}
