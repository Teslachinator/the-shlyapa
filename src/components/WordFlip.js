export function WordFlip({ word, scored, hint, onScore, onHat }) {
  return (
    <button type="button" className="word-row" aria-pressed={scored} onClick={scored ? onHat : onScore}>
      <span>
        {word}
        {hint ? <small className="word-owner">{hint}</small> : null}
      </span>
      <span className="flip" aria-hidden="true">
        <span className={scored ? "on score" : ""}>Засчитано</span>
        <span className={scored ? "" : "on hat"}>В шляпу</span>
      </span>
    </button>
  );
}
