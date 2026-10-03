import { Scoreboard } from "../components/Scoreboard";
import { Stage } from "../components/Stage";
import { roundById } from "../game/rounds";

export function RoundSummaryScreen({ game }) {
  const { match } = game;
  const round = roundById(match.rounds[match.roundIndex]);
  const upcoming = roundById(match.rounds[match.roundIndex + 1]);

  return (
    <Stage
      footer={
        <>
          <button type="button" className="btn btn-hat" onClick={game.nextRound}>
            Дальше: {upcoming.title}
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.requestAbort}>
            Закончить партию
          </button>
        </>
      }
    >
      <p className="kicker">раунд сыгран</p>
      <h1>{round.lead}</h1>
      <div className="stack">
        {match.teams.map((team) => (
          <div key={team.id} className="word-row">
            <span>{team.name}</span>
            <b>+{team.scores[match.roundIndex]?.length ?? 0}</b>
          </div>
        ))}
      </div>
      <Scoreboard teams={match.teams} />
      <div className="card next-card">
        <p className="kicker dark">Дальше</p>
        <h2>{upcoming.lead}</h2>
        <p className="hint">{upcoming.rules}</p>
        <p className="hint">В шляпу возвращаются те же слова.</p>
      </div>
    </Stage>
  );
}
