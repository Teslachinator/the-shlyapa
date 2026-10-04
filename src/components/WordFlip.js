export function WordFlip({ word, scored, locked, hint, hintStyle, onScore, onHat }) {
  if (locked) {
    return (
      <div className="word-row">
        <span>{word}</span>
        <span className="flip" aria-hidden="true">
          <span className="on hat">В шляпу</span>
        </span>
      </div>
    );
  }
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
