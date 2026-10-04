const NAV_BAR = 48;
const NAV_BAR_LANDSCAPE = 24;
const ALREADY_CLEAR = 64;

export function safeBottomFallback({
  android,
  appShell,
  insetBottom,
  screenHeight,
  viewportHeight,
  portrait,
}) {
  if (!android || !appShell) return null;
  if (!screenHeight || !viewportHeight) return null;
  if (insetBottom >= 8) return null;
  if (screenHeight - viewportHeight >= ALREADY_CLEAR) return null;
  return portrait ? NAV_BAR : NAV_BAR_LANDSCAPE;
}

function matches(query) {
  return window.matchMedia?.(query)?.matches === true;
}

function readInsetBottom() {
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.paddingBottom = "env(safe-area-inset-bottom, 0px)";
  document.documentElement.appendChild(probe);
  const value = Number.parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return value;
}

function cssScreenHeight() {
  const raw = window.screen?.height || 0;
  const viewport = window.innerHeight || 0;
  const dpr = window.devicePixelRatio || 1;
  if (dpr > 1 && raw > viewport * 1.5) return raw / dpr;
  return raw;
}

function applySafeBottom() {
  const fallback = safeBottomFallback({
    android: /Android/i.test(navigator.userAgent || ""),
    appShell:
      matches("(display-mode: standalone)") ||
      matches("(display-mode: fullscreen)") ||
      /; wv\)/.test(navigator.userAgent || ""),
    insetBottom: readInsetBottom(),
    screenHeight: cssScreenHeight(),
    viewportHeight: window.innerHeight || 0,
    portrait: window.innerHeight >= window.innerWidth,
  });
  const root = document.documentElement;
  if (fallback == null) root.style.removeProperty("--safe-bottom");
  else root.style.setProperty("--safe-bottom", `${fallback}px`);
}

export function installSafeArea() {
  applySafeBottom();
  window.addEventListener("resize", applySafeBottom);
  window.addEventListener("orientationchange", applySafeBottom);
}
