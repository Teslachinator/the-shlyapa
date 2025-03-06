import React, { useEffect, useState } from "react";

export const StartGame = () => {
  //   const [base, setBase] = useState([]);

  //   const fetchWords = async (difficulty) => {
  //     const url = `https://api.datamuse.com/words?ml=${
  //       difficulty === "easy" ? "cat" : "philosophy"
  //     }&max=1000`;

  //     let response = await fetch(url);
  //     let data = await response.json();

  //     return setBase(data);
  //   }

  //   useEffect(() => {
  //     fetchWords("easy");
  //   }, []);

  return (
    <div className="StartGame">
      <p>Logo</p>
      <p>правила игры</p>
      {/* <div>{`${base.map((item) => item.word)}`}</div> */}
    </div>
  );
};
