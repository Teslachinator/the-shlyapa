import { useEffect, useRef } from "react";
import "./index.css";
import { useHatGame } from "./game/useHatGame";
import { HomeScreen } from "./screens/HomeScreen";
import { RulesScreen } from "./screens/RulesScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { CoverScreen, WriteScreen } from "./screens/EntryScreens";
import { ReadyScreen } from "./screens/ReadyScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { TurnSummaryScreen } from "./screens/TurnSummaryScreen";
import { RoundSummaryScreen } from "./screens/RoundSummaryScreen";
import { FinalScreen } from "./screens/FinalScreen";

function AbortDialog({ game }) {
  const stayRef = useRef(null);
  const dismissRef = useRef(game.dismissAbort);
  dismissRef.current = game.dismissAbort;
  useEffect(() => {
    stayRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") dismissRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = game.entry
    ? "Прервать запись слов? Уже написанное пропадёт."
    : "Закончить партию? Текущий счёт пропадёт.";

  return (
    <div className="modal-back">
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="abort-title">
        <h2 id="abort-title">Точно остановить?</h2>
        <p className="hint">{copy}</p>
        <button ref={stayRef} type="button" className="btn btn-hat" onClick={game.dismissAbort}>
          Остаться
        </button>
        <button type="button" className="btn btn-ghost" onClick={game.abort}>
          Остановить
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const game = useHatGame();
  return (
    <div className="app">
      {game.view === "home" && <HomeScreen game={game} />}
      {game.view === "rules" && <RulesScreen game={game} />}
      {game.view === "setup" && <SetupScreen game={game} />}
      {game.view === "cover" && <CoverScreen game={game} />}
      {game.view === "write" && <WriteScreen key={game.entry.index} game={game} />}
      {game.view === "ready" && <ReadyScreen game={game} />}
      {game.view === "play" && <PlayScreen game={game} />}
      {game.view === "turnSummary" && <TurnSummaryScreen game={game} />}
      {game.view === "roundSummary" && <RoundSummaryScreen game={game} />}
      {game.view === "finished" && <FinalScreen game={game} />}
      {game.askAbort ? <AbortDialog game={game} /> : null}
    </div>
  );
}
