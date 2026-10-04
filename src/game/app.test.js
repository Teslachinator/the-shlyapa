import { fireEvent, render, screen, act } from "@testing-library/react";
import { StrictMode } from "react";
import App from "../App";

const EIGHT = ["арбуз", "банан", "вишня", "груша", "дыня", "ежевика", "инжир", "киви"];

function renderGame() {
  localStorage.clear();
  return render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

async function startDictionary() {
  fireEvent.click(screen.getByRole("button", { name: "Начать партию" }));
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function wordOnSlip() {
  return document.querySelector(".slip-word")?.textContent ?? "";
}

describe("партия на экране", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      text: async () => EIGHT.join("\n"),
    }));
  });

  test("словарь, пас, три раунда и итог", async () => {
    renderGame();
    expect(screen.getByRole("heading", { name: "The Shlyapa" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Правила" }));
    expect(screen.getByRole("heading", { name: "Правила" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Понятно" }));

    fireEvent.click(screen.getByRole("button", { name: "Играть" }));
    const keeper = screen.getByDisplayValue("Кепка");
    fireEvent.change(keeper, { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Начать партию" }));
    expect(screen.getByRole("alert").textContent).toMatch(/имена/);
    fireEvent.change(keeper, { target: { value: "Кепка" } });
    fireEvent.click(screen.getByRole("button", { name: "20" }));

    await startDictionary();
    expect(screen.getByText(/В шляпе 8/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Объяснение словами" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Показать слово" }));
    const first = wordOnSlip();
    fireEvent.click(screen.getByRole("button", { name: "В шляпу" }));
    expect(wordOnSlip()).not.toBe(first);
    expect(screen.getByText(/этот ход \+0/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Угадали" }));
    expect(screen.getByText(/этот ход \+1/)).toBeTruthy();

    while (screen.queryByRole("button", { name: "Угадали" })) {
      fireEvent.click(screen.getByRole("button", { name: "Угадали" }));
    }
    expect(screen.getByRole("heading", { name: "+8" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { pressed: true })[0]);
    expect(screen.getByRole("heading", { name: "+7" })).toBeTruthy();

    const finish = (stop) => {
      for (let step = 0; step < 80; step += 1) {
        if (stop?.()) return;
        if (screen.queryByRole("button", { name: "Ещё партию" })) return;
        const show = screen.queryByRole("button", { name: "Показать слово" });
        if (show) {
          fireEvent.click(show);
          continue;
        }
        const guess = screen.queryByRole("button", { name: "Угадали" });
        if (guess) {
          fireEvent.click(guess);
          continue;
        }
        const buzz = screen.queryByRole("button", { name: "Да, угадали" });
        if (buzz) {
          fireEvent.click(buzz);
          continue;
        }
        const next = screen.queryByRole("button", { name: /Дальше:|Завершить раунд|К итогам/ });
        if (next) {
          fireEvent.click(next);
          continue;
        }
        throw new Error(document.body.textContent.slice(0, 240));
      }
      throw new Error("партия не дошла до итога");
    };

    fireEvent.click(screen.getByRole("button", { name: /Дальше:/ }));
    fireEvent.click(screen.getByRole("button", { name: "Показать слово" }));
    fireEvent.click(screen.getByRole("button", { name: "Угадали" }));
    fireEvent.click(screen.getByRole("button", { name: "Завершить раунд" }));
    expect(screen.getByRole("heading", { name: "Объяснение словами" })).toBeTruthy();
    expect(screen.getByText(/\+7/)).toBeTruthy();
    expect(screen.getByText(/\+1/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Дальше: Одно слово" }));
    expect(screen.getByRole("heading", { name: "Объяснение одним словом" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Показать слово" }));
    expect(screen.getByText("Только одно слово, без пояснений")).toBeTruthy();

    finish(() => screen.queryByRole("heading", { level: 1, name: "Пантомима" }));
    fireEvent.click(screen.getByRole("button", { name: "Показать слово" }));
    expect(screen.getByText("Без слов, звуков и букв")).toBeTruthy();
    finish();

    expect(screen.getByRole("button", { name: "Ещё партию" })).toBeTruthy();
    const totals = [...document.querySelectorAll("tbody tr")].map((row) =>
      Number(row.lastElementChild.textContent)
    );
    expect(totals.reduce((sum, value) => sum + value, 0)).toBe(24);
  });

  test("свои слова не показываются следующему и ловят повтор", async () => {
    renderGame();
    fireEvent.click(screen.getByRole("button", { name: "Играть" }));
    fireEvent.click(screen.getByRole("button", { name: "Свои слова" }));
    fireEvent.click(screen.getByRole("button", { name: "Убрать игрока Пончик" }));
    fireEvent.click(screen.getByRole("button", { name: "Убрать игрока Вареник" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Писать слова" }));

    expect(screen.getByRole("heading", { name: "Передайте телефон" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Писать слова" }));
    let fields = screen.getAllByRole("textbox");
    ["арбуз", "арбуз", "вишня", "груша"].forEach((word, index) => {
      fireEvent.change(fields[index], { target: { value: word } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Положить в шляпу" }));
    expect(screen.getByText("Такое слово уже есть")).toBeTruthy();

    fields = screen.getAllByRole("textbox");
    fireEvent.change(fields[1], { target: { value: "банан" } });
    fireEvent.click(screen.getByRole("button", { name: "Положить в шляпу" }));
    expect(screen.queryByText("арбуз")).toBeNull();
    expect(screen.getByText("Барсук")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Писать слова" }));
    fields = screen.getAllByRole("textbox");
    ["дыня", "ежевика", "инжир", "киви"].forEach((word, index) => {
      fireEvent.change(fields[index], { target: { value: word } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Положить в шляпу" }));
    expect(screen.getByText(/В шляпе 8/)).toBeTruthy();
    expect(screen.queryByText("арбуз")).toBeNull();
  });

  test("по истечении времени слово можно засчитать", async () => {
    jest.useFakeTimers();
    try {
      renderGame();
      fireEvent.click(screen.getByRole("button", { name: "Играть" }));
      fireEvent.click(screen.getByRole("button", { name: "20" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Начать партию" }));
        await Promise.resolve();
        await Promise.resolve();
      });
      fireEvent.click(screen.getByRole("button", { name: "Показать слово" }));
      const shown = wordOnSlip();
      act(() => {
        jest.advanceTimersByTime(21000);
      });
      expect(screen.getByRole("button", { name: "Да, угадали" })).toBeTruthy();
      expect(wordOnSlip()).toBe(shown);
      fireEvent.click(screen.getByRole("button", { name: "Да, угадали" }));
      expect(screen.getByRole("heading", { name: "+1" })).toBeTruthy();
      expect(screen.getByText(shown)).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
