import { Scoreboard } from "../components/Scoreboard";
import { Stage } from "../components/Stage";
import { getTurn } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

export function RoundSummaryScreen({ game }) {
  const { match } = game;
  const round = roundById(match.rounds[match.roundIndex]);
  const last = match.roundIndex >= match.rounds.length - 1;
  const upcoming = last ? null : roundById(match.rounds[match.roundIndex + 1]);
  const nextTurn = upcoming ? getTurn(match) : null;

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
      <div className="round-tallies">
        {match.teams.map((team) => (
          <div key={team.id} className="round-tally" style={teamStyle(team.color)}>
            <span>{team.name}</span>
            <b>+{team.scores[match.roundIndex]?.length ?? 0}</b>
          </div>
        ))}
      </div>
      {nextTurn ? (
        <div className="card next-card" style={teamStyle(nextTurn.team.color)}>
          <p className="kicker dark">Дальше</p>
          <p className="next-who">{nextTurn.explainer}</p>
          <p className="next-team">{nextTurn.team.name}</p>
          <h2>{upcoming.lead}</h2>
          <div className="next-hints">
            <p className="hint">{upcoming.rules}</p>
            <p className="hint">В шляпу возвращаются те же слова.</p>
          </div>
        </div>
      ) : null}
      <Scoreboard teams={match.teams} />
    </Stage>
  );
}
