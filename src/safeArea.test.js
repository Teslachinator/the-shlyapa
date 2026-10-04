import { safeBottomFallback } from "./safeArea";

const edgeToEdge = {
  android: true,
  appShell: true,
  insetBottom: 0,
  screenHeight: 800,
  viewportHeight: 800,
  portrait: true,
};

describe("нижний отступ в приложении", () => {
  test("андроид на весь экран без inset получает высоту панели", () => {
    expect(safeBottomFallback(edgeToEdge)).toBe(48);
  });

  test("если панель уже сообщена, запас не нужен", () => {
    expect(safeBottomFallback({ ...edgeToEdge, insetBottom: 34 })).toBeNull();
  });

  test("в обычном браузере запас не добавляется", () => {
    expect(safeBottomFallback({ ...edgeToEdge, appShell: false })).toBeNull();
  });

  test("если окно уже короче экрана, контент и так выше панели", () => {
    expect(
      safeBottomFallback({ ...edgeToEdge, screenHeight: 800, viewportHeight: 720 })
    ).toBeNull();
  });

  test("на айфоне остаётся системный inset", () => {
    expect(safeBottomFallback({ ...edgeToEdge, android: false })).toBeNull();
  });

  test("в альбомной ориентации запас меньше", () => {
    expect(safeBottomFallback({ ...edgeToEdge, portrait: false })).toBe(24);
  });
});
