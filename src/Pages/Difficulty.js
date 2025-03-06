import React from "react";
import { Range } from "react-range";

export const Difficulty = () => {
  const [values, setValues] = React.useState([50]);
  return (
    <div>
      <p>сложность</p>
      <div>
        количество слов: {values}
        <br />
        <br />
        <Range
          label="Select your value"
          step={5}
          min={10}
          max={100}
          values={values}
          onChange={(values) => setValues(values)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: "6px",
                width: "100%",
                backgroundColor: "red",
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              key={props.key}
              style={{
                ...props.style,
                height: "42px",
                width: "42px",
                borderRadius: "30%",
                backgroundColor: "black",
              }}
            />
          )}
        />
      </div>
    </div>
  );
};
