import React, { useCallback, useEffect, useRef, useMemo } from "react";
import debounce from "lodash.debounce";

type ValidationResponse = string | boolean;
type Validator = (
  value: any
) => ValidationResponse | Promise<ValidationResponse>;

const style = { display: "contents" };

interface Options {
  debounceWait?: number;
  getValueFromInput?: (input: HTMLInputElement) => unknown;
  getInputFromWrapper?: (wrapper: HTMLDivElement) => HTMLInputElement;
}

const useValidation = (validator: Validator, options: Options = {}) => {
  const parent = useRef<HTMLDivElement>(null);
  const debounceWait = useMemo(() => options.debounceWait || 0, [
    options.debounceWait,
  ]);
  const getValueFromInput = useMemo(
    () =>
      options.getValueFromInput || ((input: HTMLInputElement) => input.value),
    [options.getValueFromInput]
  );
  const getInputFromWrapper = useMemo(
    () =>
      options.getInputFromWrapper ||
      ((wrapper: HTMLDivElement) => wrapper.children[0] as HTMLInputElement),
    [options.getInputFromWrapper]
  );
  const actOnInput = useCallback(
    (callback: (input: HTMLInputElement) => void) => {
      parent.current && callback(getInputFromWrapper(parent.current));
    },
    [getInputFromWrapper]
  );
  const setMessage = useCallback(
    (message: string) => {
      actOnInput((input) => input.setCustomValidity(message));
    },
    [actOnInput]
  );
  const debouncedValidation = useCallback(
    debounce((resolve: (value?: unknown) => void) => {
      actOnInput((input) => resolve(validator(getValueFromInput(input))));
    }, debounceWait),
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
