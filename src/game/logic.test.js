import {
  beginTurn,
  confirmTurn,
  continueAfterRound,
  countPieces,
  createMatch,
  getTurn,
  guessWord,
  noWordsLeft,
  passWord,
  awardRoundWord,
  awardTurnWord,
  finishMatch,
  releaseRoundWord,
  resolveBuzzer,
  revokeTurnWord,
  teamTotal,
  timeUp,
} from "./engine";
import { DEFAULT_SETUP, freshTeam, randomTeamName, sanitizeSetup, TEAM_NAMES, validateSetup } from "./setup";
import { checkDrafts, mergeWords, uniqueWords } from "./words";

const identity = () => 0.999999;

const teams = [
  { id: "a", name: "Красные", color: 0, players: ["Аня", "Боря"] },
  { id: "b", name: "Синие", color: 1, players: ["Вася"] },
];

function party(words = ["арбуз", "банан", "вишня"], rounds = ["explain", "oneWord"]) {
  return createMatch({
    teams,
    words,
    rounds,
    turnSeconds: 30,
    random: identity,
  });
}

describe("шляпа", () => {
  test("ход снимает слово со шляпы и не теряет карточки", () => {
    let state = party();
    expect(state.phase).toBe("ready");
    expect(state.hat).toEqual(["арбуз", "банан", "вишня"]);
    state = beginTurn(state);
    expect(state.currentWord).toBe("вишня");
    expect(state.hat).toEqual(["арбуз", "банан"]);
    expect(countPieces(state)).toBe(3);

    state = passWord(state);
    expect(state.currentWord).toBe("банан");
    expect(state.passed).toEqual(["вишня"]);
    expect(countPieces(state)).toBe(3);

    state = guessWord(state);
    expect(state.turnGuessed).toEqual(["банан"]);
    expect(countPieces(state)).toBe(3);

    state = timeUp(state);
    expect(state.phase).toBe("buzzer");
    expect(state.buzzerWord).toBe("арбуз");
    state = resolveBuzzer(state, false);
    expect(state.phase).toBe("turnSummary");
    expect(state.hat).toContain("арбуз");
    expect(countPieces(state)).toBe(3);

    state = confirmTurn(state);
    expect(teamTotal(state.teams[0])).toBe(1);
    expect(getTurn(state).explainer).toBe("Вася");
    expect(state.phase).toBe("ready");
    expect(countPieces(state)).toBe(3);
  });

  test("последнее слово завершает раунд, те же слова возвращаются", () => {
    let state = beginTurn(party());
    while (state.phase === "play") state = guessWord(state);
    expect(state.phase).toBe("turnSummary");
    expect(state.turnGuessed).toEqual(["вишня", "банан", "арбуз"]);
    state = confirmTurn(state);
    expect(state.phase).toBe("roundSummary");
    expect(noWordsLeft(state)).toBe(true);
    expect(teamTotal(state.teams[0]) + teamTotal(state.teams[1])).toBe(3);

    state = continueAfterRound(state);
    expect(state.roundIndex).toBe(1);
    expect(state.phase).toBe("ready");
    expect([...state.hat].sort()).toEqual(["арбуз", "банан", "вишня"]);
    expect(teamTotal(state.teams[0])).toBe(3);
  });

  test("отмена слова возвращает его в шляпу", () => {
    let state = beginTurn(party(["кепка"]));
    state = guessWord(state);
    expect(state.phase).toBe("turnSummary");
    state = revokeTurnWord(state, "кепка");
    expect(state.turnGuessed).toEqual([]);
    expect(state.hat).toEqual(["кепка"]);
    state = confirmTurn(state);
    expect(state.phase).toBe("ready");
    expect(countPieces(state)).toBe(1);
  });

  test("пропущенное слово можно засчитать до конца хода", () => {
    let state = beginTurn(party(["арбуз", "банан"]));
    state = guessWord(state);
    state = timeUp(state);
    state = resolveBuzzer(state, false);
    expect(state.phase).toBe("turnSummary");
    expect(state.hat).toEqual(["арбуз"]);
    state = awardTurnWord(state, "арбуз");
    expect(state.turnGuessed).toEqual(["банан", "арбуз"]);
    expect(state.hat).toEqual([]);
    expect(countPieces(state)).toBe(2);
    state = confirmTurn(state);
    expect(state.phase).toBe("roundSummary");
    expect(teamTotal(state.teams[0])).toBe(2);
  });

  test("после раунда слово можно снять и засчитать другой команде", () => {
    let state = beginTurn(party(["арбуз", "банан"], ["explain"]));
    while (state.phase === "play") state = guessWord(state);
    state = confirmTurn(state);
    expect(state.phase).toBe("roundSummary");
    state = releaseRoundWord(state, "арбуз");
    expect(state.hat).toEqual(["арбуз"]);
    expect(state.teams[0].scores[0]).toEqual(["банан"]);
    expect(countPieces(state)).toBe(2);
    state = awardRoundWord(state, "арбуз", "b");
    expect(state.hat).toEqual([]);
    expect(state.teams[1].scores[0]).toEqual(["арбуз"]);
    expect(teamTotal(state.teams[0]) + teamTotal(state.teams[1])).toBe(2);
    state = finishMatch(state);
    expect(state.phase).toBe("finished");
  });

  test("последний раунд заканчивает партию", () => {
    let state = beginTurn(party(["кепка"], ["mime"]));
    state = guessWord(state);
    state = confirmTurn(state);
    expect(state.phase).toBe("roundSummary");
    state = finishMatch(state);
    expect(state.phase).toBe("finished");
  });

  test("повтор единственного слова после паса не теряет карточку", () => {
    let state = beginTurn(party(["кепка"]));
    state = passWord(state);
    expect(state.currentWord).toBe("кепка");
    expect(countPieces(state)).toBe(1);
  });

  test("проверка своих слов и настроек", () => {
    expect(uniqueWords(" Арбуз \r\nарбуз\n\nёж\n")).toEqual(["Арбуз", "ёж"]);
    expect(mergeWords([["Арбуз", "Банан"], ["арбуз", "Вишня"]])).toEqual(["Арбуз", "Банан", "Вишня"]);
    expect(checkDrafts(["", "Арбуз", "арбуз"], ["ёж"])).toEqual([
      "Впишите слово",
      "",
      "Такое слово уже есть",
    ]);
    expect(validateSetup(DEFAULT_SETUP)).toEqual([]);
    const broken = sanitizeSetup({
      teams: [
        { id: "a", name: "Раз", color: 0, players: [" "] },
        { id: "b", name: "Два", color: 1, players: ["Оля"] },
      ],
      rounds: [],
      wordCount: 1000,
      turnSeconds: 15,
    });
    expect(broken.wordCount).toBe(80);
    expect(sanitizeSetup({ dictionary: "hard" }).dictionaries).toEqual(["hard"]);
    expect(sanitizeSetup({ dictionaries: ["stars", "easy", "nope"] }).dictionaries).toEqual([
      "easy",
      "stars",
    ]);
    expect(sanitizeSetup({ wordCount: 8 }).wordCount).toBe(20);
    expect(sanitizeSetup({ wordCount: 23 }).wordCount).toBe(25);
    expect(broken.turnSeconds).toBe(30);
    expect(broken.rounds).toEqual(["explain", "oneWord", "mime"]);
    expect(validateSetup(broken).some((error) => error.includes("имена"))).toBe(true);
    expect(DEFAULT_SETUP.teams.map((team) => team.name)).toEqual([TEAM_NAMES[0], TEAM_NAMES[1]]);
    expect(new Set(DEFAULT_SETUP.teams.map((team) => team.name)).size).toBe(2);
    const migrated = sanitizeSetup(
      {
        teams: [
          { id: "t1", name: "Красные", color: 0, players: ["Кепка", "Пончик"] },
          { id: "t2", name: "Синие", color: 1, players: ["Барсук", "Вареник"] },
        ],
      },
      () => 0.5
    );
    expect(migrated.teams.map((team) => team.name)).toEqual([TEAM_NAMES[10], TEAM_NAMES[9]]);
    expect(randomTeamName([], () => 0)).toBe(TEAM_NAMES[0]);
    expect(randomTeamName([TEAM_NAMES[0]], () => 0)).toBe(TEAM_NAMES[1]);
    const custom = sanitizeSetup({
      teams: [
        { id: "a", name: "Красные", color: 0, players: ["Аня"] },
        { id: "b", name: "Волки", color: 1, players: ["Боря"] },
      ],
    });
    expect(custom.teams.map((team) => team.name)).toEqual(["Красные", "Волки"]);
    const third = freshTeam(DEFAULT_SETUP.teams, () => 0);
    expect(third.name).toBe(TEAM_NAMES[2]);
    expect(third.players).toEqual(["Кактус", "Пельмень"]);
  });
});
