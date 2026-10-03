import { useEffect, useRef, useState } from "react";
import {
  beginTurn as openTurn,
  confirmTurn as closeTurn,
  continueAfterRound,
  createMatch,
  guessWord,
  passWord,
  resolveBuzzer as closeBuzzer,
  revokeTurnWord,
  timeUp,
} from "./engine";
import {
  playFanfare,
  playHorn,
  playPass,
  playPop,
  playTick,
  pulse,
  unlockAudio,
} from "./feedback";
import { ROUNDS } from "./rounds";
import {
  createEntry,
  DEFAULT_SETUP,
  freshTeam,
  nextNicknames,
  sanitizeSetup,
  validateSetup,
} from "./setup";
import { DICTIONARIES, loadDictionaries, pickWords } from "./words";

const STORAGE_KEY = "shlyapa-setup-v1";

function readSetup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETUP;
    return sanitizeSetup(JSON.parse(raw));
  } catch {
    return DEFAULT_SETUP;
  }
}

export function useHatGame() {
  const [screen, setScreen] = useState("home");
  const [setup, setSetup] = useState(readSetup);
  const [match, setMatch] = useState(null);
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [askAbort, setAskAbort] = useState(false);
  const [millisLeft, setMillisLeft] = useState(0);

  const rulesFrom = useRef("home");
  const matchRef = useRef(null);
  const guard = useRef(null);
  const deadlineRef = useRef(0);
  const lastSec = useRef(null);
  const soundRef = useRef(true);
  const busyRef = useRef(false);
  const entryLock = useRef(false);
  const pausedAt = useRef(0);

  matchRef.current = match;
  soundRef.current = setup.sound;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
    } catch {
      /* настройки останутся до конца визита */
    }
  }, [setup]);

  useEffect(() => {
    entryLock.current = false;
  }, [entry?.index, entry?.stage, screen]);

  const awake = Boolean(match || entry);
  useEffect(() => {
    if (!awake || !navigator.wakeLock?.request) return undefined;
    let lock;
    let cancelled = false;
    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        if (cancelled) sentinel.release();
        else lock = sentinel;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      lock?.release();
    };
  }, [awake]);

  const phase = match?.phase;
  const serial = match?.serial;

  useEffect(() => {
    if (phase !== "play" || serial == null) return undefined;
    const turnSerial = serial;
    lastSec.current = null;
    let fired = false;
    const id = window.setInterval(() => {
      if (pausedAt.current) return;
      const left = deadlineRef.current - Date.now();
      setMillisLeft(Math.max(0, left));
      if (left <= 0) {
        if (fired) return;
        fired = true;
        window.clearInterval(id);
        setMatch((current) => {
          if (!current || current.phase !== "play" || current.serial !== turnSerial) return current;
          return timeUp(current);
        });
        if (soundRef.current) playHorn();
        pulse([40, 30, 70]);
        return;
      }
      const sec = Math.ceil(left / 1000);
      if (sec <= 5 && sec !== lastSec.current) {
        lastSec.current = sec;
        if (soundRef.current) playTick();
        pulse(12);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [phase, serial]);

  function setField(key, value) {
    setError("");
    setSetup((current) => ({ ...current, [key]: value }));
  }

  function updateTeam(teamId, updater) {
    setError("");
    setSetup((current) => ({
      ...current,
      teams: current.teams.map((team) => (team.id === teamId ? updater(team) : team)),
    }));
  }

  function setTeamName(teamId, name) {
    updateTeam(teamId, (team) => ({ ...team, name }));
  }

  function setPlayer(teamId, index, value) {
    updateTeam(teamId, (team) => ({
      ...team,
      players: team.players.map((player, playerIndex) => (playerIndex === index ? value : player)),
    }));
  }

  function addPlayer(teamId) {
    setError("");
    setSetup((current) => ({
      ...current,
      teams: current.teams.map((team) => {
        if (team.id !== teamId || team.players.length >= 8) return team;
        return { ...team, players: [...team.players, nextNicknames(current.teams, 1)[0]] };
      }),
    }));
  }

  function removePlayer(teamId, index) {
    updateTeam(teamId, (team) =>
      team.players.length <= 1
        ? team
        : { ...team, players: team.players.filter((_, playerIndex) => playerIndex !== index) }
    );
  }

  function addTeam() {
    setError("");
    setSetup((current) =>
      current.teams.length >= 6
        ? current
        : { ...current, teams: [...current.teams, freshTeam(current.teams)] }
    );
  }

  function removeTeam(teamId) {
    setError("");
    setSetup((current) =>
      current.teams.length <= 2
        ? current
        : { ...current, teams: current.teams.filter((team) => team.id !== teamId) }
    );
  }

  function toggleDictionary(id) {
    setError("");
    setSetup((current) => {
      const has = current.dictionaries.includes(id);
      if (has && current.dictionaries.length === 1) return current;
      const order = DICTIONARIES.map((item) => item.id);
      const dictionaries = has
        ? current.dictionaries.filter((itemId) => itemId !== id)
        : order.filter((itemId) => current.dictionaries.includes(itemId) || itemId === id);
      return { ...current, dictionaries };
    });
  }

  function toggleRound(id) {
    setError("");
    setSetup((current) => {
      const has = current.rounds.includes(id);
      if (has && current.rounds.length === 1) return current;
      const order = ROUNDS.map((round) => round.id);
      const rounds = has
        ? current.rounds.filter((roundId) => roundId !== id)
        : order.filter((roundId) => current.rounds.includes(roundId) || roundId === id);
      return { ...current, rounds };
    });
  }

  function goHome() {
    pausedAt.current = 0;
    setAskAbort(false);
    setMatch(null);
    setEntry(null);
    setScreen("home");
  }

  function goSetup() {
    pausedAt.current = 0;
    setAskAbort(false);
    setMatch(null);
    setEntry(null);
    setError("");
    setScreen("setup");
  }

  function openRules() {
    rulesFrom.current = screen === "setup" ? "setup" : "home";
    setScreen("rules");
  }

  function closeRules() {
    setScreen(rulesFrom.current);
  }

  function leaveEntry() {
    if (!entry) return;
    if (entry.words.length > 0 || entry.stage === "write") {
      setAskAbort(true);
      return;
    }
    setMatch(null);
    setEntry(null);
    setScreen("setup");
  }

  async function start() {
    const problems = validateSetup(setup);
    if (problems.length) {
      setError(problems[0]);
      return;
    }
    if (busyRef.current) return;
    setError("");
    if (setup.source === "custom") {
      setMatch(null);
      setEntry(createEntry(setup));
      setScreen("entry");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const pool = await loadDictionaries(setup.dictionaries);
      if (!pool.length) throw new Error("empty");
      setMatch(
        createMatch({
          teams: setup.teams,
          words: pickWords(pool, setup.wordCount),
          rounds: setup.rounds,
          turnSeconds: setup.turnSeconds,
        })
      );
      setEntry(null);
      setScreen("match");
    } catch {
      setError("Не удалось открыть словари. Обновите страницу и попробуйте снова.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function openWrite() {
    setEntry((current) => (current ? { ...current, stage: "write" } : current));
  }

  function submitWords(list) {
    if (entryLock.current || !entry) return;
    entryLock.current = true;
    const words = [...entry.words, ...list.map((word) => word.trim())];
    const nextIndex = entry.index + 1;
    if (nextIndex >= entry.queue.length) {
      setMatch(
        createMatch({
          teams: setup.teams,
          words,
          rounds: setup.rounds,
          turnSeconds: setup.turnSeconds,
        })
      );
      setEntry(null);
      setScreen("match");
      return;
    }
    setEntry({ ...entry, words, index: nextIndex, stage: "cover" });
  }

  function begin() {
    const current = matchRef.current;
    if (!current || current.phase !== "ready") return;
    unlockAudio();
    pausedAt.current = 0;
    deadlineRef.current = Date.now() + current.turnSeconds * 1000;
    setMillisLeft(current.turnSeconds * 1000);
    guard.current = null;
    setMatch(openTurn(current));
  }

  function actOnWord(kind) {
    const current = matchRef.current;
    if (!current || current.phase !== "play" || pausedAt.current) return;
    if (Date.now() >= deadlineRef.current) return;
    if (guard.current === current.drawId) return;
    guard.current = current.drawId;
    const emptied = kind === "guess" && current.hat.length + current.passed.length === 0;
    if (soundRef.current) {
      if (kind === "guess") playPop();
      else playPass();
      if (emptied) playFanfare();
    }
    pulse(emptied ? [16, 24, 16] : 10);
    setMatch((latest) => {
      if (!latest || latest.phase !== "play" || latest.drawId !== current.drawId) return latest;
      return kind === "guess" ? guessWord(latest) : passWord(latest);
    });
  }

  function guess() {
    actOnWord("guess");
  }

  function pass() {
    actOnWord("pass");
  }

  function resolveBuzzer(guessed) {
    if (soundRef.current) {
      if (guessed) playPop();
      else playPass();
    }
    pulse(10);
    setMatch((current) => (current ? closeBuzzer(current, guessed) : current));
  }

  function revoke(word) {
    setMatch((current) => (current ? revokeTurnWord(current, word) : current));
  }

  function confirmTurn() {
    setMatch((current) => (current ? closeTurn(current) : current));
  }

  function nextRound() {
    setMatch((current) => (current ? continueAfterRound(current) : current));
  }

  function requestAbort() {
    if (matchRef.current?.phase === "play" && !pausedAt.current) {
      pausedAt.current = Date.now();
    }
    setAskAbort(true);
  }

  function dismissAbort() {
    if (pausedAt.current) {
      deadlineRef.current += Date.now() - pausedAt.current;
      pausedAt.current = 0;
    }
    setAskAbort(false);
  }

  function abort() {
    pausedAt.current = 0;
    deadlineRef.current = 0;
    setAskAbort(false);
    setMatch(null);
    setEntry(null);
    setScreen("setup");
  }

  let view = screen;
  if (screen === "entry") view = entry?.stage === "write" ? "write" : "cover";
  if (screen === "match") view = match?.phase || "setup";

  return {
    view,
    setup,
    match,
    entry,
    error,
    busy,
    askAbort,
    millisLeft,
    goHome,
    goSetup,
    openRules,
    closeRules,
    leaveEntry,
    setField,
    setTeamName,
    setPlayer,
    addPlayer,
    removePlayer,
    addTeam,
    removeTeam,
    toggleRound,
    toggleDictionary,
    start,
    openWrite,
    submitWords,
    begin,
    guess,
    pass,
    resolveBuzzer,
    revoke,
    confirmTurn,
    nextRound,
    requestAbort,
    dismissAbort,
    abort,
  };
}
