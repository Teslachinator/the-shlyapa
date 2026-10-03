import { useRef, useState } from "react";
import { Stage } from "../components/Stage";
import { teamStyle } from "../game/palette";
import { checkDrafts } from "../game/words";

export function CoverScreen({ game }) {
  const { entry } = game;
  const person = entry.queue[entry.index];
  return (
    <Stage
      className="cover"
      style={teamStyle(person.color)}
      footer={
        <>
          <button type="button" className="btn btn-hat" onClick={game.openWrite}>
            Писать слова
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.leaveEntry}>
            Назад
          </button>
        </>
      }
    >
      <div className="home-hero">
        <p className="kicker">
          {entry.index + 1} из {entry.queue.length}
        </p>
        <h1>Передайте телефон</h1>
        <p className="who">{person.player}</p>
        <p className="lede">
          {person.teamName}. Остальные не смотрят на экран.
          {entry.words.length
            ? ` В шляпе уже ${entry.words.length}.`
            : " Шляпа пока пустая."}
        </p>
      </div>
    </Stage>
  );
}

export function WriteScreen({ game }) {
  const { entry } = game;
  const person = entry.queue[entry.index];
  const [drafts, setDrafts] = useState(() => Array.from({ length: entry.perPlayer }, () => ""));
  const [problems, setProblems] = useState(() => Array.from({ length: entry.perPlayer }, () => ""));
  const inputs = useRef([]);

  function change(index, value) {
    setDrafts((current) => current.map((word, item) => (item === index ? value : word)));
    setProblems((current) => current.map((problem, item) => (item === index ? "" : problem)));
  }

  function submit(event) {
    event.preventDefault();
    const nextProblems = checkDrafts(drafts, entry.words);
    setProblems(nextProblems);
    const first = nextProblems.findIndex(Boolean);
    if (first >= 0) {
      inputs.current[first]?.focus();
      return;
    }
    game.submitWords(drafts);
  }

  function onKeyDown(event, index) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (index < drafts.length - 1) inputs.current[index + 1]?.focus();
    else event.currentTarget.form?.requestSubmit();
  }

  return (
    <Stage
      style={teamStyle(person.color)}
      footer={
        <button type="submit" form="word-form" className="btn btn-hat">
          Положить в шляпу
        </button>
      }
    >
      <form id="word-form" onSubmit={submit}>
        <p className="kicker">{person.teamName}</p>
        <h1>{person.player}</h1>
        <p className="lede left">
          {entry.perPlayer} существительных в именительном падеже. Экран больше не покажет эти слова.
        </p>
        <div className="stack">
          {drafts.map((word, index) => (
            <label key={index} className="card field">
              Слово {index + 1}
              <input
                ref={(node) => {
                  inputs.current[index] = node;
                }}
                type="text"
                value={word}
                maxLength={40}
                autoFocus={index === 0}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint={index === drafts.length - 1 ? "done" : "next"}
                aria-invalid={Boolean(problems[index])}
                aria-describedby={problems[index] ? `word-error-${index}` : undefined}
                onChange={(event) => change(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(event, index)}
              />
              {problems[index] ? (
                <span id={`word-error-${index}`} className="field-error">
                  {problems[index]}
                </span>
              ) : null}
            </label>
          ))}
        </div>
      </form>
    </Stage>
  );
}
