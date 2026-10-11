import { nextColor } from "./palette";
import { nextIndex, randomId, shuffle } from "./random";
import { ROUNDS } from "./rounds";
import { DICTIONARIES } from "./words";

export const TURN_OPTIONS = [20, 30, 45, 60, 90];
export const WORD_MIN = 20;
export const WORD_MAX = 80;
export const WORD_STEP = 5;

export const TEAM_NAMES = [
  "Сигмы района",
  "Ризз-патруль",
  "Аурафармеры",
  "Скибиди-шляпы",
  "Делюлю-клуб",
  "Мейны сезона",
  "НПС на чилле",
  "Вайб-кодекс",
  "Мангалкины",
  "Кринж-патруль",
  "Флекс-машина",
  "Потные бляди",
  "Потаскумбрии",
  "Клатч или бан",
  "Тильт-мастерс",
  "Чилл до талого",
  "Рофлодромы",
  "Гоатед шляпы",
  "Альфа-пельмени",
  "Слэй-комитет",
];

export const NICKNAMES = [
  "Кепка",
  "Пончик",
  "Барсук",
  "Вареник",
  "Кактус",
  "Пельмень",
  "Шляпник",
  "Бублик",
  "Утюг",
  "Сырок",
  "Крокодил",
  "Ватрушка",
  "Пингвин",
  "Чебурек",
  "Самовар",
  "Тапок",
  "Лимон",
  "Бегемот",
  "Пряник",
  "Енот",
  "Краш",
  "Гигачад",
  "Душнила",
  "Нормис",
  "Скуф",
  "Зумер",
  "Брейнрот",
  "Глейзер",
  "Кукед",
  "Коуп",
  "Дрип",
  "Смурф",
  "Керри",
  "Фидер",
  "Токсик",
  "Анон",
  "Бустер",
  "Стример",
  "Пранкер",
  "Думер",
];

const TEAM_TEMPLATE = [
  { id: "t1", color: 0, players: ["Кепка", "Пончик"] },
  { id: "t2", color: 1, players: ["Барсук", "Вареник"] },
];

function takenSet(takenNames) {
  return new Set(takenNames.map((name) => String(name).trim()).filter(Boolean));
}

export function randomTeamName(takenNames, random = Math.random) {
  const taken = takenSet(takenNames);
  const free = TEAM_NAMES.filter((name) => !taken.has(name));
  const pool = free.length ? free : [`Команда ${taken.size + 1}`];
  return pool[nextIndex(pool.length, random)];
}

export function drawTeamName(deck, takenNames, random = Math.random) {
  const taken = takenSet(takenNames);
  const pending = Array.isArray(deck) ? deck : shuffle(TEAM_NAMES, random);
  const rest = [];
  let name = "";
  for (const candidate of pending) {
    if (taken.has(candidate)) continue;
    if (!name) name = candidate;
    else rest.push(candidate);
  }
  if (name) return { name, deck: rest };
  const pool = TEAM_NAMES.filter((item) => !taken.has(item));
  const source = pool.length ? pool : [`Команда ${taken.size + 1}`];
  const next = shuffle(source, random);
  return { name: next[0], deck: next.slice(1) };
}

export function createDefaultTeams(random = Math.random) {
  const names = [];
  return TEAM_TEMPLATE.map((team) => {
    const name = randomTeamName(names, random);
    names.push(name);
    return { ...team, name, players: [...team.players] };
  });
}

export const DEFAULT_SETUP = {
  teams: createDefaultTeams(() => 0),
  source: "dictionary",
  dictionaries: ["easy"],
  wordCount: 30,
  wordsPerPlayer: 5,
  turnSeconds: 30,
  rounds: ["explain", "mime", "oneWord"],
  sound: true,
};

function sanitizeDictionaries(input) {
  const raw = Array.isArray(input?.dictionaries)
    ? input.dictionaries
    : input?.dictionary
      ? [input.dictionary]
      : DEFAULT_SETUP.dictionaries;
  const order = DICTIONARIES.map((item) => item.id);
  const picked = order.filter((id) => raw.includes(id));
  return picked.length ? picked : [...DEFAULT_SETUP.dictionaries];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function snapWordCount(value) {
  const clamped = clamp(Number(value) || 30, WORD_MIN, WORD_MAX);
  return clamp(Math.round(clamped / WORD_STEP) * WORD_STEP, WORD_MIN, WORD_MAX);
}

function normalizeTeam(team, index) {
  if (!team || typeof team !== "object") return null;
  const players = Array.isArray(team.players)
    ? team.players
        .slice(0, 8)
        .map((player) => String(player ?? "").slice(0, 24))
    : ["Игрок 1"];
  return {
    id: typeof team.id === "string" && team.id ? team.id : `t-${index}`,
    name: String(team.name ?? `Команда ${index + 1}`).slice(0, 24),
    color: Number.isInteger(team.color) ? team.color : index % 6,
    players: players.length ? players : ["Игрок 1"],
  };
}

export function sanitizeSetup(input, random = Math.random) {
  const source = input?.source === "custom" ? "custom" : "dictionary";
  const dictionaries = sanitizeDictionaries(input);
  const picked = Array.isArray(input?.rounds)
    ? ROUNDS.map((round) => round.id).filter((id) => input.rounds.includes(id))
    : [...DEFAULT_SETUP.rounds];
  let teams = Array.isArray(input?.teams)
    ? input.teams.slice(0, 6).map(normalizeTeam).filter(Boolean)
    : [];
  if (teams.length < 2) teams = createDefaultTeams(random);
  return {
    source,
    dictionaries,
    rounds: picked.length ? picked : [...DEFAULT_SETUP.rounds],
    wordCount: snapWordCount(input?.wordCount),
    wordsPerPlayer: clamp(Number(input?.wordsPerPlayer) || 5, 4, 10),
    turnSeconds: TURN_OPTIONS.includes(Number(input?.turnSeconds))
      ? Number(input.turnSeconds)
      : 30,
    sound: input?.sound !== false,
    teams,
  };
}

export function validateSetup(setup) {
  const errors = [];
  if (setup.teams.length < 2) errors.push("Нужны минимум две команды.");
  if (setup.teams.length > 6) errors.push("Команд может быть не больше шести.");
  setup.teams.forEach((team) => {
    if (!team.name.trim()) errors.push("У каждой команды должно быть имя.");
    if (team.players.length < 1 || team.players.length > 8) {
      errors.push("В команде от одного до восьми игроков.");
    }
    if (team.players.some((player) => !player.trim())) {
      errors.push("Впишите имена всех игроков.");
    }
  });
  if (setup.rounds.length < 1) errors.push("Оставьте хотя бы один раунд.");
  if (setup.source !== "custom" && setup.dictionaries.length < 1) {
    errors.push("Отметьте хотя бы один словарь.");
  }
  return [...new Set(errors)];
}

export function createEntry(setup) {
  const queue = [];
  setup.teams.forEach((team) => {
    team.players.forEach((player) => {
      const name = player.trim();
      if (!name) return;
      queue.push({
        teamId: team.id,
        teamName: team.name.trim(),
        color: team.color,
        player: name,
      });
    });
  });
  return {
    queue,
    index: 0,
    stage: "cover",
    words: [],
    perPlayer: setup.wordsPerPlayer,
  };
}

export function nextNicknames(teams, count) {
  const taken = new Set(
    teams.flatMap((team) => team.players.map((player) => player.trim())),
  );
  const free = NICKNAMES.filter((name) => !taken.has(name));
  return Array.from(
    { length: count },
    (_, index) => free[index] || `Игрок ${taken.size + index + 1}`,
  );
}

export function freshTeam(teams, random = Math.random) {
  return {
    id: `t-${randomId(random)}`,
    name: randomTeamName(
      teams.map((team) => team.name),
      random,
    ),
    color: nextColor(teams),
    players: nextNicknames(teams, 2),
  };
}
