import { WordFlip } from "../components/WordFlip";
import { Scoreboard } from "../components/Scoreboard";
import { Stage } from "../components/Stage";
import { roundById } from "../game/rounds";

function byRussian(left, right) {
  return left.localeCompare(right, "ru");
}

export function RoundSummaryScreen({ game }) {
  const { match } = game;
  const round = roundById(match.rounds[match.roundIndex]);
  const last = match.roundIndex >= match.rounds.length - 1;
  const upcoming = last ? null : roundById(match.rounds[match.roundIndex + 1]);
  const words = [...match.deck].sort(byRussian);
  const held = match.held || {};

  return (
    <Stage
      footer={
        <>
          {last ? (
            <button type="button" className="btn btn-hat" onClick={game.showFinal}>
              К итогам
            </button>
          ) : (
            <button type="button" className="btn btn-hat" onClick={game.nextRound}>
              Дальше: {upcoming.title}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={game.requestAbort}>
            Закончить партию
          </button>
        </>
      }
    >
      <p className="kicker">раунд сыгран</p>
      <h1>{round.lead}</h1>
      <p className="lede left">У каждого слова выберите: засчитано или в шляпу.</p>
      <div className="stack">
        {match.teams.map((team) => (
          <div key={team.id} className="word-row">
            <span>{team.name}</span>
            <b>+{team.scores[match.roundIndex]?.length ?? 0}</b>
          </div>
        ))}
      </div>
      <div className="stack">
        {words.map((word) => {
          const owner = match.teams.find((team) =>
            (team.scores[match.roundIndex] || []).includes(word)
          );
          const restoreId = owner?.id || held[word];
          return (
            <WordFlip
              key={word}
              word={word}
              scored={Boolean(owner)}
              hint={owner?.name}
              onScore={() => {
                if (!owner && restoreId) game.awardWord(word, restoreId);
              }}
              onHat={() => {
                if (owner) game.releaseWord(word);
              }}
            />
          );
        })}
      </div>
      <Scoreboard teams={match.teams} />
      {upcoming ? (
        <div className="card next-card">
          <p className="kicker dark">Дальше</p>
          <h2>{upcoming.lead}</h2>
          <p className="hint">{upcoming.rules}</p>
          <p className="hint">В шляпу возвращаются те же слова.</p>
        </div>
      ) : null}
    </Stage>
  );
}
