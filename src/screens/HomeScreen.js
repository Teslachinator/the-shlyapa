import { useEffect, useRef, useState } from "react";
import { HatMark } from "../components/HatMark";
import { Stage } from "../components/Stage";

const INSTALL_CASES = [
  {
    title: "iPhone, Safari",
    text: "Нажмите «Поделиться», затем «На экран Домой». Открывайте The Shlyapa с иконки.",
  },
  {
    title: "Android, Chrome",
    text: "Меню → «Добавить на главный экран» или «Установить приложение». По адресу в локальной сети панель часто остаётся.",
  },
];

function installHint() {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true;
  if (standalone) return null;
  return { cases: INSTALL_CASES };
}

function InstallNotice({ hint, collapsed, onCollapse, onExpand }) {
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);
  const windowRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    windowRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      barRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="install-layer">
      {collapsed ? (
        <button
          ref={barRef}
          type="button"
          className="install-chip"
          onClick={onExpand}
        >
          Без рамок
        </button>
      ) : (
        <div className="install-banner">
          <button
            ref={barRef}
            type="button"
            className="install-banner-main"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            Можно сделать без рамок
          </button>
          <button
            type="button"
            className="install-collapse"
            aria-label="Свернуть"
            onClick={() => {
              setOpen(false);
              onCollapse();
            }}
          >
            <span className="install-x" aria-hidden="true" />
          </button>
        </div>
      )}
      {open && !collapsed ? (
        <div className="install-back" onClick={() => setOpen(false)}>
          <div
            ref={windowRef}
            className="install-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="kicker" id="install-title">
              без рамок
            </p>
            <ul className="install-cases">
              {hint.cases.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="text-btn"
              onClick={() => setOpen(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HomeScreen({ game }) {
  const hint = installHint();
  const [collapsed, setCollapsed] = useState(false);
  const frameClass = [
    "home-frame",
    hint ? "has-notice" : "",
    collapsed ? "is-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={frameClass}>
      <Stage
        className="home"
        footer={
          <>
            <button
              type="button"
              className="btn btn-hat"
              onClick={game.goSetup}
            >
              Играть
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={game.openRules}
            >
              Правила
            </button>
          </>
        }
      >
        <div className="home-hero">
          <HatMark />
          <p className="kicker">командная игра</p>
          <h1>The Shlyapa</h1>
          <p className="lede">
            Объясните слово, пока идёт время. Потом — одно слово и пантомима.
            Телефон передают по кругу.
          </p>
        </div>
      </Stage>
      {hint ? (
        <InstallNotice
          hint={hint}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
        />
      ) : null}
    </div>
  );
}
