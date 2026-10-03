import { shuffle } from "./engine";

export const DICTIONARIES = [
  {
    id: "novice",
    file: "novice.txt",
    title: "Новички",
    text: "Бытовые слова для первой партии.",
  },
  {
    id: "easy",
    file: "easy.txt",
    title: "Лёгкие",
    text: "Знакомые слова, словарь шире.",
  },
  {
    id: "medium",
    file: "medium.txt",
    title: "Средние",
    text: "Без самых простых и без редкостей.",
  },
  {
    id: "rare",
    file: "rare.txt",
    title: "Редкие",
    text: "Малоизвестные слова для бывалых.",
  },
  {
    id: "hard",
    file: "hard.txt",
    title: "Сложные",
    text: "Их трудно объяснять по правилам шляпы.",
  },
  {
    id: "stars",
    file: "stars.txt",
    title: "Знаменитости",
    text: "Имена. Отдельный вариант: здесь как раз имена собственные.",
  },
];

export function uniqueWords(text) {
  const seen = new Set();
  const words = [];
  for (const line of text.split(/\r?\n/)) {
    const word = line.replace(/^\uFEFF/, "").trim();
    if (word.length < 2) continue;
    const key = word.toLocaleLowerCase("ru");
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(word);
  }
  return words;
}

export function pickWords(pool, count, random = Math.random) {
  return shuffle(pool, random).slice(0, Math.min(count, pool.length));
}

export async function loadDictionary(id) {
  const item = DICTIONARIES.find((dictionary) => dictionary.id === id) ?? DICTIONARIES[0];
  const response = await fetch(`${process.env.PUBLIC_URL}/dictionaries/${item.file}`);
  if (!response.ok) throw new Error("dictionary");
  return uniqueWords(await response.text());
}

export function mergeWords(lists) {
  return uniqueWords(lists.flat().join("\n"));
}

export async function loadDictionaries(ids) {
  const selected = DICTIONARIES.filter((item) => ids.includes(item.id));
  const lists = await Promise.all(selected.map((item) => loadDictionary(item.id)));
  return mergeWords(lists);
}

export function checkDrafts(drafts, existing) {
  const problems = Array(drafts.length).fill("");
  const seen = new Set(existing.map((word) => word.trim().toLocaleLowerCase("ru")));
  drafts.forEach((raw, index) => {
    const word = raw.trim();
    if (word.length < 2 || word.length > 40 || !/[0-9A-Za-zА-Яа-яЁё]/.test(word)) {
      problems[index] = "Впишите слово";
      return;
    }
    const key = word.toLocaleLowerCase("ru");
    if (seen.has(key)) {
      problems[index] = "Такое слово уже есть";
      return;
    }
    seen.add(key);
  });
  return problems;
}
