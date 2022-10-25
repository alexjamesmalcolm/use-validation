import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import useValidation, {
  CacheOptions,
  ValidationResponse,
  Validator,
} from "./lib/useValidation";
import styles from "./App.module.css";

const defaultFunction = () => {};

let cache: Record<string, ValidationResponse> = {};

const cacheOptions: CacheOptions<string> = {
  setCache: (value, validationResponse) => {
    console.log("Setting cache", value, validationResponse);
    cache[value] = validationResponse;
  },
  getCache: (value) => {
    console.log(`Retrieving from cache`, value, cache[value]);
    return cache[value];
  },
};
const clearCache = () => {
  cache = {};
};

const App = ({ onSubmit = defaultFunction }) => {
  const [desiredValue, setDesiredValue] = useState<string>("19");
  const [value, setValue] = useState<string>("");
  const isDesiredValue = useCallback<Validator>(
    (value) => {
      console.log(`Checking if value is valid`, value);
      if (value !== desiredValue) {
        return {
          isValid: false,
          errorMessage: `Is not desired value: ${desiredValue}`,
        };
      }
      return { isValid: true };
    },
    [desiredValue]
  );
  const handleDesiredValueChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((e) => setDesiredValue(e.target.value), []);
  const handleValueChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setValue(e.target.value),
    []
  );
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDesiredValue(Math.floor(Math.random() * 100).toString());
      clearCache();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);
  const Validator = useValidation(isDesiredValue, {
    cache: cacheOptions,
  });
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
