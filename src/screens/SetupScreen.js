import { Stage } from "../components/Stage";
import { teamStyle } from "../game/palette";
import { ROUNDS } from "../game/rounds";
import { TURN_OPTIONS, WORD_MAX, WORD_MIN, WORD_STEP } from "../game/setup";
import { DICTIONARIES } from "../game/words";

export function SetupScreen({ game }) {
  const { setup } = game;
  const people = setup.teams.reduce((sum, team) => sum + team.players.length, 0);
  const wordFill = ((setup.wordCount - WORD_MIN) / (WORD_MAX - WORD_MIN)) * 100;

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
            {game.busy ? "Мешаем шляпу…" : setup.source === "custom" ? "Писать слова" : "Начать партию"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.goHome}>
            На главную
          </button>
        </>
      }
    >
      <p className="kicker">партия</p>
      <h1>Перед игрой</h1>
      <div className="stack">
        {setup.teams.map((team, teamIndex) => (
          <article key={team.id} className="card team-card" style={teamStyle(team.color)}>
            <label className="field">
              Команда {teamIndex + 1}
              <input
                type="text"
                value={team.name}
                maxLength={24}
                onChange={(event) => game.setTeamName(team.id, event.target.value)}
              />
            </label>
            <div className="players">
              {team.players.map((player, index) => (
                <div className="player-row" key={`${team.id}-${index}`}>
                  <input
                    type="text"
                    value={player}
                    maxLength={24}
                    aria-label={`Игрок ${index + 1}, ${team.name}`}
                    placeholder="Имя"
                    onChange={(event) => game.setPlayer(team.id, index, event.target.value)}
                  />
                  {team.players.length > 1 ? (
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Убрать игрока ${player || index + 1}`}
                      onClick={() => game.removePlayer(team.id, index)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="row-actions">
              {team.players.length < 8 ? (
                <button type="button" className="text-btn dark" onClick={() => game.addPlayer(team.id)}>
                  Ещё участник
                </button>
              ) : null}
              {setup.teams.length > 2 ? (
                <button type="button" className="text-btn dark" onClick={() => game.removeTeam(team.id)}>
                  Убрать команду
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {setup.teams.length < 6 ? (
          <button type="button" className="btn btn-ghost" onClick={game.addTeam}>
            Ещё команда
          </button>
        ) : null}

        <p className="section-title">Слова</p>
        <div className="card">
          <div className="segment" role="group" aria-label="Откуда брать слова">
            <button
              type="button"
              aria-pressed={setup.source === "dictionary"}
              onClick={() => game.setField("source", "dictionary")}
            >
              Из словаря
            </button>
            <button
              type="button"
              aria-pressed={setup.source === "custom"}
              onClick={() => game.setField("source", "custom")}
            >
              Свои слова
            </button>
          </div>

          {setup.source === "dictionary" ? (
            <>
              <fieldset className="choices">
                <legend>Словари</legend>
                <p className="hint tight">Слова возьмутся случайно из всех отмеченных.</p>
                {DICTIONARIES.map((item) => (
                  <label key={item.id} className="choice">
                    <input
                      type="checkbox"
                      checked={setup.dictionaries.includes(item.id)}
                      onChange={() => game.toggleDictionary(item.id)}
                    />
                    <span>
                      <b>{item.title}</b>
                      <small>{item.text}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="hat-count">
                <span>Слов в шляпе</span>
                <strong>{setup.wordCount}</strong>
                <input
                  className="hat-range"
                  type="range"
                  min={WORD_MIN}
                  max={WORD_MAX}
                  step={WORD_STEP}
                  value={setup.wordCount}
                  aria-valuetext={`${setup.wordCount} слов`}
                  style={{
                    "--track": `linear-gradient(90deg, #8f2d2d ${wordFill}%, rgba(28, 20, 16, 0.14) ${wordFill}%)`,
                  }}
                  onChange={(event) => game.setField("wordCount", Number(event.target.value))}
                />
                <span className="hat-count-scale">
                  <span>{WORD_MIN}</span>
                  <span>{WORD_MAX}</span>
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="hint">
                Каждый по очереди вписывает слова, остальные не подглядывают. Подойдут нарицательные
                существительные в именительном падеже.
              </p>
              <label className="field">
                Слов от каждого: {setup.wordsPerPlayer}
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={1}
                  value={setup.wordsPerPlayer}
                  onChange={(event) => game.setField("wordsPerPlayer", Number(event.target.value))}
                />
              </label>
              <p className="hint">В шляпе будет {people * setup.wordsPerPlayer}.</p>
            </>
          )}
        </div>

        <p className="section-title">Ход</p>
        <div className="card">
          <p className="hint tight">Секунд на объяснение</p>
          <div className="chips" role="group" aria-label="Длительность хода">
            {TURN_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                aria-pressed={setup.turnSeconds === seconds}
                onClick={() => game.setField("turnSeconds", seconds)}
              >
                {seconds}
              </button>
            ))}
          </div>
        </div>

        <p className="section-title">Раунды</p>
        <div className="card">
          {ROUNDS.map((round) => (
            <label key={round.id} className="check-row">
              <span>
                <b>{round.lead}</b>
                <small>{round.setup}</small>
              </span>
              <input
                type="checkbox"
                checked={setup.rounds.includes(round.id)}
                onChange={() => game.toggleRound(round.id)}
              />
            </label>
          ))}
        </div>

        <p className="section-title">Сигнал</p>
        <div className="card">
          <label className="check-row">
            <span>
              <b>Сигнал времени</b>
              <small>Звук на последних секундах и в конце хода.</small>
            </span>
            <input
              type="checkbox"
              checked={setup.sound}
              onChange={(event) => game.setField("sound", event.target.checked)}
            />
          </label>
        </div>

        <button type="button" className="text-btn" onClick={game.openRules}>
          Открыть правила
        </button>
      </div>
    </Stage>
  );
}
