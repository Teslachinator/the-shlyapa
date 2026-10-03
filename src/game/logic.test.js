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
  resolveBuzzer,
  revokeTurnWord,
  teamTotal,
  timeUp,
} from "./engine";
import { DEFAULT_SETUP, sanitizeSetup, validateSetup } from "./setup";
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

  test("последний раунд заканчивает партию", () => {
    let state = beginTurn(party(["кепка"], ["mime"]));
    state = guessWord(state);
    state = confirmTurn(state);
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
  });
});
