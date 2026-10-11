import { Stage } from "../components/Stage";
import { teamTotal } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

function byRussian(left, right) {
  return left.localeCompare(right, "ru");
}

export function FinalScreen({ game }) {
  const { match } = game;
  const ranked = [...match.teams].sort((a, b) => teamTotal(b) - teamTotal(a));
  const best = teamTotal(ranked[0]);
  const winners = ranked.filter((team) => teamTotal(team) === best);
  const tied = winners.length > 1;
  const words = [...(match.deck || [])].sort(byRussian);

  return (
    <Stage
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
      <div className="finale-words">
        <h2>Все слова</h2>
        <ul>
          {words.map((word, index) => (
            <li key={`${word}-${index}`}>{word}</li>
          ))}
        </ul>
      </div>
    </Stage>
  );
}
