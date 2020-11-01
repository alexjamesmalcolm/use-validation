import React, { useCallback, useEffect, useState } from "react";
import useValidation, { Validator } from "./lib/useValidation";
import styles from "./App.module.css";

const defaultFunction = () => {};

const App = ({ onSubmit = defaultFunction }) => {
  const [desiredValue, setDesiredValue] = useState<string>("19");
  const [value, setValue] = useState<string>("");
  const isDesiredValue = useCallback<Validator>(
    (value) => {
      if (value !== desiredValue) {
        return `Is not desired value: ${desiredValue}`;
      }
      return true;
    },
    [desiredValue]
  );
  const handleDesiredValueChange = useCallback(
    (e) => setDesiredValue(e.target.value),
    []
  );
  const handleValueChange = useCallback((e) => setValue(e.target.value), []);
  useEffect(() => {
    const intervalId = setInterval(
      () => setDesiredValue(Math.floor(Math.random() * 100).toString()),
      2000
    );
    return () => clearInterval(intervalId);
  }, []);
  const Validator = useValidation(isDesiredValue);
  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <label>
        Desired Value:
        <input value={desiredValue} onChange={handleDesiredValueChange} />
      </label>
      <label>
        Value:
        <Validator>
          <input value={value} onChange={handleValueChange} />
        </Validator>
      </label>
      <input id="submit" type="submit" />
    </form>
  );
};

export default App;
