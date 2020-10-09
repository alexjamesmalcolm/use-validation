import React, { useCallback, useState } from "react";
import useValidation from "./lib/useValidation";
import styles from "./App.module.css";

const isNumberPositive = (number: number) => {
  if (number < 0) {
    return `${number} is less than zero`;
  }
  return true;
};

const isPokemon = (name: string) => {
  if (!name) return true;
  if (!isNaN(Number(name))) return "This is a number";
  return fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`, {
    headers: { "Content-Type": "application/json" },
    method: "HEAD",
  })
    .then((response) => {
      if (response.status === 200) return true;
      if (response.status === 404) return `${name} is not a pokemon`;
      return false;
    })
    .catch((e) => e.message);
};

const defaultFunction = () => {};

const App = ({ onSubmit = defaultFunction }) => {
  // const PositiveNumberValidator = useValidation(isNumberPositive);
  // const DebouncedPositiveNumberValidator = useValidation(isNumberPositive, {
  // debounceWait: 2000,
  // });
  const [pokemonName, setPokemonName] = useState();
  // const PokemonNameValidator = useValidation(isPokemon, { debounceWait: 2000 });
  const handlePokemonNameChange = useCallback(
    (e) => setPokemonName(e.target.value),
    []
  );
  const [firstMatch, setFirstMatch] = useState("");
  const [secondMatch, setSecondMatch] = useState("");
  const handleFirstMatchChange = useCallback(
    (e) => setFirstMatch(e.target.value),
    []
  );
  const handleSecondMatchChange = useCallback(
    (e) => setSecondMatch(e.target.value),
    []
  );
  const isFirstMatchValid = useCallback<(value: string) => string | boolean>(
    (value) => {
      console.log("isFirstMatchValid");
      return value === secondMatch ? true : `Does not match ${secondMatch}`;
    },
    [secondMatch]
  );
  const isSecondMatchValid = useCallback<(value: string) => string | boolean>(
    (value) => {
      console.log("isSecondMatchValid");
      return value === firstMatch ? true : `Does not match ${firstMatch}`;
    },
    [firstMatch]
  );
  const FirstMatchValidator = useValidation(isFirstMatchValid, {
    debounceWait: 1000,
  });
  const SecondMatchValidator = useValidation(isSecondMatchValid, {
    debounceWait: 1000,
  });
  return (
    <form className={styles.container} onSubmit={onSubmit}>
      {/* <label>
        Positive Number
        <PositiveNumberValidator>
          <input id="positive-number" max="10" type="number" required />
        </PositiveNumberValidator>
      </label>
      <label>
        Positive Number but validated after typing stops for 2000 millisecond
        <DebouncedPositiveNumberValidator>
          <input id="positive-number-debounced" type="number" required />
        </DebouncedPositiveNumberValidator>
      </label>
      <label>
        Pokemon name: {pokemonName}
        <PokemonNameValidator>
          <input
            id="pokemon-name"
            type="text"
            required
            value={pokemonName}
            onChange={handlePokemonNameChange}
          />
        </PokemonNameValidator>
      </label> */}
      <label>
        First of Match: {firstMatch}
        <FirstMatchValidator>
          <input
            id="first-match"
            type="text"
            required
            value={firstMatch}
            onChange={handleFirstMatchChange}
          />
        </FirstMatchValidator>
      </label>
      <label>
        Second of Match: {secondMatch}
        <SecondMatchValidator>
          <input
            id="second-match"
            type="text"
            required
            value={secondMatch}
            onChange={handleSecondMatchChange}
          />
        </SecondMatchValidator>
      </label>
      <input id="submit" type="submit" />
    </form>
  );
};

export default App;
