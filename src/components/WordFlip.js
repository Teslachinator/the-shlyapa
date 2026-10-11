export function WordFlip({ word, scored, hint, hintStyle, onScore, onHat }) {
  return (
    <button type="button" className="word-row" aria-pressed={scored} onClick={scored ? onHat : onScore}>
      <span>
        {word}
        {hint ? (
          <small className="word-owner" style={hintStyle}>
            {hint}
          </small>
        ) : null}
      </span>
      <span className="flip" aria-hidden="true">
        <span className={scored ? "on score" : ""}>Засчитано</span>
        <span className={scored ? "" : "on hat"}>В шляпу</span>
      </span>
    </button>
  );
}
