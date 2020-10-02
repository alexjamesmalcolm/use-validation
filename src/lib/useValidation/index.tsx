import React, { useCallback, useEffect, useRef } from "react";
import debounce from "lodash.debounce";

type ValidationResponse = string | boolean;
type Validator = (
  value: any
) => ValidationResponse | Promise<ValidationResponse>;

const style = { display: "contents" };

const useValidation = (validator: Validator, debounceWait?: number) => {
  const parent = useRef<HTMLDivElement>(null);
  const actOnInput = useCallback(
    (callback: (input: HTMLInputElement) => void) => {
      parent.current &&
        callback(parent.current.children[0] as HTMLInputElement);
    },
    []
  );
  const setMessage = useCallback(
    (message: string) => {
      actOnInput((input) => input.setCustomValidity(message));
    },
    [actOnInput]
  );
  const debouncedValidation = useCallback(
    debounce((resolve: (value?: unknown) => void) => {
      actOnInput((input) => resolve(validator(input.value)));
    }, debounceWait || 0),
    []
  );
  const checkValidity = useCallback(
    () =>
      new Promise((resolve) => {
        setMessage("Validating...");
        debouncedValidation(resolve);
      }),
    [debouncedValidation, setMessage]
  );
  const reportValidity = useCallback(() => {
    checkValidity().then((validityCheckResult) => {
      setMessage(
        typeof validityCheckResult === "string"
          ? validityCheckResult
          : !validityCheckResult
          ? "Invalid"
          : ""
      );
    });
  }, [checkValidity, setMessage]);
  useEffect(() => {
    reportValidity();
  }, [reportValidity, validator]);
  return useCallback(
    ({ children }) => (
      <div onChangeCapture={reportValidity} ref={parent} style={style}>
        {children}
      </div>
    ),
    [reportValidity]
  );
};

export default useValidation;
