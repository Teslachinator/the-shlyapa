import { HatMark } from "../components/HatMark";
import { Stage } from "../components/Stage";

export function HomeScreen({ game }) {
  return (
    <Stage
      className="home"
      footer={
        <>
          <button type="button" className="btn btn-hat" onClick={game.goSetup}>
            Играть
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.openRules}>
            Правила
          </button>
        </>
      }
    >
      <div className="home-hero">
        <HatMark />
        <p className="kicker">командная игра</p>
        <h1>Шляпа</h1>
        <p className="lede">
          Объясните слово, пока идёт время. Потом — одно слово и пантомима. Телефон передают по кругу.
        </p>
      </div>
    </Stage>
  );
}
