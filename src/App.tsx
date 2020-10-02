import React from "react";
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

const App = () => {
  const PositiveNumberValidator = useValidation(isNumberPositive);
  const DebouncedPositiveNumberValidator = useValidation(isNumberPositive, {
    debounceWait: 2000,
  });
  const PokemonNameValidator = useValidation(isPokemon, { debounceWait: 2000 });
  return (
    <form className={styles.container}>
      <label>
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
        Pokemon name
        <PokemonNameValidator>
          <input id="pokemon-name" type="text" required />
        </PokemonNameValidator>
      </label>
      <input type="submit" />
    </form>
  );
};

export default App;
