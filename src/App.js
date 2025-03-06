import { useState } from "react";
import "./App.css";
import { StartGame } from "./Pages/StartGame";
import { steps } from "./helpers/steps";
import { Difficulty } from "./Pages/Difficulty";
function App() {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step === steps.main) {
      return;
    }
    setStep(step - 1);
  };

  console.log(step);

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={prevStep}>назад</button>
      </header>
      <section>
        {step === steps.main && <StartGame />}
        {step === steps.difficulty && <Difficulty />}
      </section>
      <footer>
        <button onClick={nextStep}>Следующий шаг</button>
      </footer>
    </div>
  );
}

export default App;

{
  /* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */
}
