const NAV_BAR = 48;
const NAV_BAR_LANDSCAPE = 24;
const ALREADY_CLEAR = 48;
const KEYBOARD_GAP = 120;

export function viewportHeight({ inner, visual, scale = 1 }) {
  if (!inner) return Math.round(visual || 0);
  if (!visual || scale !== 1) return Math.round(inner);
  const gap = inner - visual;
  if (gap > 0 && gap <= KEYBOARD_GAP) return Math.round(visual);
  return Math.round(inner);
}

export function safeBottomFallback({
  android,
  insetBottom,
  screenHeight,
  viewportHeight: height,
  portrait,
}) {
  if (!android) return null;
  if (!screenHeight || !height) return null;
  if (insetBottom >= 8) return null;
  if (screenHeight - height >= ALREADY_CLEAR) return null;
  return portrait ? NAV_BAR : NAV_BAR_LANDSCAPE;
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

function cssScreenHeight(viewport) {
  const raw = window.screen?.height || 0;
  const dpr = window.devicePixelRatio || 1;
  if (dpr > 1 && raw > viewport * 1.5) return raw / dpr;
  return raw;
}

function applyViewport() {
  const height = viewportHeight({
    inner: window.innerHeight || 0,
    visual: window.visualViewport?.height || 0,
    scale: window.visualViewport?.scale || 1,
  });
  const root = document.documentElement;
  if (height > 0) root.style.setProperty("--app-height", `${height}px`);

  const fallback = safeBottomFallback({
    android: /Android/i.test(navigator.userAgent || ""),
    insetBottom: readInsetBottom(),
    screenHeight: cssScreenHeight(height),
    viewportHeight: height,
    portrait: window.innerHeight >= window.innerWidth,
  });
  if (fallback == null) root.style.removeProperty("--safe-bottom");
  else root.style.setProperty("--safe-bottom", `${fallback}px`);
}

export function installSafeArea() {
  applyViewport();
  window.addEventListener("resize", applyViewport);
  window.addEventListener("orientationchange", applyViewport);
  window.visualViewport?.addEventListener("resize", applyViewport);
}
