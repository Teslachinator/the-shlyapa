import { getTurn } from "../game/engine";
import { teamStyle } from "../game/palette";

export function BuzzerScreen({ game }) {
  const { match } = game;
  const { team } = getTurn(match);
  return (
    <section className="screen screen-play" style={teamStyle(team.color)}>
      <h1 className="sr-only">Время вышло. {match.buzzerWord}</h1>
      <header className="play-top">
        <button type="button" className="text-btn" onClick={game.requestAbort}>
          Стоп
        </button>
        <p className="clock zero">0</p>
        <p className="team-name">{team.name}</p>
      </header>
      <p className="ban">Успели назвать это слово?</p>
      <div className="play-center">
        <div className="slip">
          <span className="slip-kicker">время</span>
          <p className={match.buzzerWord.length > 16 ? "slip-word compact" : "slip-word display"}>
            {match.buzzerWord}
          </p>
        </div>
      </div>
      <div className="play-actions">
        <button type="button" className="btn btn-ghost" onClick={() => game.resolveBuzzer(false)}>
          Нет, в шляпу
        </button>
        <button type="button" className="btn btn-yes" onClick={() => game.resolveBuzzer(true)}>
          Да, угадали
        </button>
      </div>
    </section>
  );
}
