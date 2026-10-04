import { safeBottomFallback, viewportHeight } from "./safeArea";

const edgeToEdge = {
  android: true,
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

  test("в обычном браузере, где окно короче экрана, запас не добавляется", () => {
    expect(
      safeBottomFallback({ ...edgeToEdge, screenHeight: 800, viewportHeight: 640 })
    ).toBeNull();
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

describe("высота видимого окна", () => {
  test("совпадает с окном, когда панели нет", () => {
    expect(viewportHeight({ inner: 800, visual: 800 })).toBe(800);
  });

  test("берёт меньшую высоту, если низ спрятан панелью браузера", () => {
    expect(viewportHeight({ inner: 800, visual: 720 })).toBe(720);
  });

  test("не сжимается из-за клавиатуры", () => {
    expect(viewportHeight({ inner: 800, visual: 500 })).toBe(800);
  });

  test("при масштабе остаётся высота окна", () => {
    expect(viewportHeight({ inner: 800, visual: 400, scale: 2 })).toBe(800);
  });
});
