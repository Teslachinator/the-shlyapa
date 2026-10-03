import { Stage } from "../components/Stage";
import { teamTotal } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

export function FinalScreen({ game }) {
  const { match } = game;
  const ranked = [...match.teams].sort((a, b) => teamTotal(b) - teamTotal(a));
  const best = teamTotal(ranked[0]);
  const winners = ranked.filter((team) => teamTotal(team) === best);
  const tied = winners.length > 1;

  return (
    <Stage
      className="finale"
      footer={
        <>
          {game.error ? (
            <p className="form-error" role="alert">
              {game.error}
            </p>
          ) : null}
          <button type="button" className="btn btn-hat" onClick={game.start} disabled={game.busy}>
            {game.busy ? "Мешаем шляпу…" : "Ещё партию"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.goSetup}>
            Изменить настройки
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.goHome}>
            На главную
          </button>
        </>
      }
    >
      <div className="scraps" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <i
            key={index}
            style={{
              left: `${(index * 8.5) % 100}%`,
              animationDelay: `${(index % 6) * 0.28}s`,
              background: index % 2 ? "#e2b15a" : "#f3ead7",
              width: index % 3 === 0 ? 12 : 8,
            }}
          />
        ))}
      </div>
      <p className="kicker">{tied ? "ничья" : "победитель"}</p>
      <h1>{tied ? "Поровну" : winners[0].name}</h1>
      <p className="lede left">
        {tied
          ? `${winners.map((team) => team.name).join(" и ")} — по ${best}.`
          : `${best} за всю партию.`}
      </p>
      <div className="table-wrap">
        <table className="grid">
          <thead>
            <tr>
              <th>Команда</th>
              {match.rounds.map((id) => (
                <th key={id}>{roundById(id).title}</th>
              ))}
              <th>Всего</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team) => (
              <tr key={team.id} style={teamStyle(team.color)}>
                <td>{team.name}</td>
                {team.scores.map((words, index) => (
                  <td key={match.rounds[index]}>{words.length}</td>
                ))}
                <td>
                  <b>{teamTotal(team)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Stage>
  );
}
