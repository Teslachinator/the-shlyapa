import { useEffect, useRef } from "react";
import { getTurn } from "../game/engine";
import { teamStyle } from "../game/palette";
import { roundById } from "../game/rounds";

export function PlayScreen({ game }) {
  const { match } = game;
  const round = roundById(match.rounds[match.roundIndex]);
  const { team } = getTurn(match);
  const secs = Math.max(0, Math.ceil(game.millisLeft / 1000));
  const ratio = Math.max(0, Math.min(1, game.millisLeft / (match.turnSeconds * 1000)));
  const urgent = game.millisLeft <= 5000;
  const guessRef = useRef(game.guess);
  const passRef = useRef(game.pass);
  const blockedRef = useRef(game.askAbort);
  guessRef.current = game.guess;
  passRef.current = game.pass;
  blockedRef.current = game.askAbort;

  useEffect(() => {
    const onKey = (event) => {
      if (event.repeat || blockedRef.current) return;
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        guessRef.current();
      } else if (event.code === "Backspace" || event.code === "KeyP") {
        event.preventDefault();
        passRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const wordSize = match.currentWord.length > 16 ? "compact" : "display";

  return (
    <section
      className={urgent ? "screen screen-play urgent" : "screen screen-play"}
      style={teamStyle(team.color)}
    >
      <h1 className="sr-only">
        {round.lead}. Ходят {team.name}
      </h1>
      <div className="fuse" aria-hidden="true">
        <div className="fuse-bar" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <header className="play-top">
        <button type="button" className="text-btn" onClick={game.requestAbort}>
          Стоп
        </button>
        <p className="clock" role="timer" aria-label={`Осталось ${secs} секунд`}>
          {secs}
        </p>
        <p className="team-name">{team.name}</p>
      </header>
      <div className="rule-hint">
        <p>{round.ban}</p>
      </div>
      <div className="play-center">
        <div className="slip" key={match.drawId}>
          <span className="slip-kicker">
            этот ход +{match.turnGuessed.length} · ещё {match.hat.length + match.passed.length}
          </span>
          <p className={`slip-word ${wordSize}`}>{match.currentWord}</p>
        </div>
      </div>
      <div className="play-actions">
        <button type="button" className="btn btn-ghost" onClick={game.pass}>
          В шляпу
        </button>
        <button type="button" className="btn btn-yes" onClick={game.guess}>
          Угадали
        </button>
        <p className="keyhint">Пробел — угадали, P — в шляпу</p>
      </div>
    </section>
  );
}
