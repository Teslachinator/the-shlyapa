export function shuffle(list, random = Math.random) {
  const items = [...list];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.min(index, Math.floor(random() * (index + 1)));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

function draw(hat, passed, random) {
  if (hat.length === 0) {
    if (passed.length === 0) {
      return { hat, passed, word: null };
    }
    const shuffled = shuffle(passed, random);
    return {
      hat: shuffled.slice(0, -1),
      passed: [],
      word: shuffled[shuffled.length - 1],
    };
  }
  return {
    hat: hat.slice(0, -1),
    passed,
    word: hat[hat.length - 1],
  };
}

export function createMatch({ teams, words, rounds, turnSeconds, random = Math.random }) {
  const deck = shuffle(words, random);
  return {
    teams: teams.map((team) => ({
      id: team.id,
      name: team.name.trim(),
      color: team.color,
      players: team.players.map((player) => player.trim()).filter(Boolean),
      explainerCursor: 0,
      scores: rounds.map(() => []),
    })),
    deck,
    hat: [...deck],
    passed: [],
    rounds: [...rounds],
    turnSeconds,
    roundIndex: 0,
    turnTeamIndex: 0,
    phase: "ready",
    currentWord: null,
    buzzerWord: null,
    turnGuessed: [],
    drawId: 0,
    serial: 0,
    turnsPlayed: 0,
    rng: random,
  };
}

export function getTurn(match) {
  const team = match.teams[match.turnTeamIndex];
  const explainer = team.players[team.explainerCursor % team.players.length];
  return { team, explainer };
}

export function getNextTeam(match) {
  return match.teams[(match.turnTeamIndex + 1) % match.teams.length];
}

export function teamTotal(team) {
  return team.scores.reduce((sum, round) => sum + round.length, 0);
}

export function noWordsLeft(match) {
  return (
    match.hat.length + match.passed.length === 0 &&
    !match.currentWord &&
    !match.buzzerWord
  );
}

export function beginTurn(state) {
  if (state.phase !== "ready") return state;
  const drawn = draw(state.hat, state.passed, state.rng);
  if (!drawn.word) return state;
  return {
    ...state,
    hat: drawn.hat,
    passed: drawn.passed,
    currentWord: drawn.word,
    phase: "play",
    turnGuessed: [],
    buzzerWord: null,
    drawId: state.drawId + 1,
    serial: state.serial + 1,
  };
}

export function guessWord(state) {
  if (state.phase !== "play" || !state.currentWord) return state;
  const turnGuessed = [...state.turnGuessed, state.currentWord];
  const drawn = draw(state.hat, state.passed, state.rng);
  if (!drawn.word) {
    return {
      ...state,
      hat: drawn.hat,
      passed: drawn.passed,
      currentWord: null,
      turnGuessed,
      phase: "turnSummary",
      drawId: state.drawId + 1,
    };
  }
  return {
    ...state,
    hat: drawn.hat,
    passed: drawn.passed,
    currentWord: drawn.word,
    turnGuessed,
    drawId: state.drawId + 1,
  };
}

export function passWord(state) {
  if (state.phase !== "play" || !state.currentWord) return state;
  const drawn = draw(state.hat, [...state.passed, state.currentWord], state.rng);
  return {
    ...state,
    hat: drawn.hat,
    passed: drawn.passed,
    currentWord: drawn.word,
    drawId: state.drawId + 1,
  };
}

export function timeUp(state) {
  if (state.phase !== "play") return state;
  if (!state.currentWord) {
    return { ...state, phase: "turnSummary" };
  }
  return {
    ...state,
    phase: "buzzer",
    buzzerWord: state.currentWord,
    currentWord: null,
  };
}

export function resolveBuzzer(state, guessed) {
  if (state.phase !== "buzzer" || !state.buzzerWord) return state;
  if (guessed) {
    return {
      ...state,
      phase: "turnSummary",
      turnGuessed: [...state.turnGuessed, state.buzzerWord],
      buzzerWord: null,
    };
  }
  return {
    ...state,
    phase: "turnSummary",
    hat: [...state.hat, state.buzzerWord],
    buzzerWord: null,
  };
}

export function revokeTurnWord(state, word) {
  if (state.phase !== "turnSummary") return state;
  const index = state.turnGuessed.indexOf(word);
  if (index < 0) return state;
  return {
    ...state,
    turnGuessed: state.turnGuessed.filter((_, item) => item !== index),
    hat: [...state.hat, word],
  };
}

export function confirmTurn(state) {
  if (state.phase !== "turnSummary") return state;
  const teams = state.teams.map((team, index) => {
    if (index !== state.turnTeamIndex) return team;
    return {
      ...team,
      explainerCursor: team.explainerCursor + 1,
      scores: team.scores.map((list, round) =>
        round === state.roundIndex ? [...list, ...state.turnGuessed] : list
      ),
    };
  });
  const remaining = [...state.hat, ...state.passed];
  const shared = {
    ...state,
    teams,
    passed: [],
    turnGuessed: [],
    currentWord: null,
    buzzerWord: null,
    turnsPlayed: state.turnsPlayed + 1,
    turnTeamIndex: (state.turnTeamIndex + 1) % teams.length,
  };
  if (remaining.length === 0) {
    const lastRound = state.roundIndex >= state.rounds.length - 1;
    return {
      ...shared,
      hat: [],
      phase: lastRound ? "finished" : "roundSummary",
    };
  }
  return {
    ...shared,
    hat: shuffle(remaining, state.rng),
    phase: "ready",
  };
}

export function continueAfterRound(state) {
  if (state.phase !== "roundSummary") return state;
  return {
    ...state,
    roundIndex: state.roundIndex + 1,
    hat: shuffle(state.deck, state.rng),
    passed: [],
    turnGuessed: [],
    currentWord: null,
    buzzerWord: null,
    phase: "ready",
  };
}

export function countPieces(state) {
  const scored = state.teams.reduce((sum, team) => sum + teamTotal(team), 0);
  return (
    scored +
    state.turnGuessed.length +
    state.hat.length +
    state.passed.length +
    (state.currentWord ? 1 : 0) +
    (state.buzzerWord ? 1 : 0)
  );
}
