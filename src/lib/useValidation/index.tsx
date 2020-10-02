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
  const {
    debounceWait,
    getInputFromWrapper = (wrapper: HTMLDivElement) =>
      wrapper.children[0] as HTMLInputElement,
    getValueFromInput,
  } = options;
  const actOnInput = useCallback(
    (callback: (input: HTMLInputElement) => void) => {
      parent.current && callback(getInputFromWrapper(parent.current));
    },
    [getInputFromWrapper]
  );
  const setMessage = useCallback<(message: string) => void>(
    (message: string) => {
      actOnInput((input) => input.setCustomValidity(message));
    },
    [actOnInput]
  );
  const debouncedValidation = useMemo<
    (resolve: (value: unknown) => void) => void
  >(
    () =>
      debounce((resolve) => {
        actOnInput((input) => {
          resolve(
            validator(
              getValueFromInput ? getValueFromInput(input) : input.value
            )
          );
        });
      }, debounceWait || 0),
    [actOnInput, debounceWait, getValueFromInput, validator]
  );
  const checkValidity = useCallback<() => Promise<unknown>>(
    () =>
      new Promise((resolve) => {
        setMessage("Validating...");
        debouncedValidation(resolve);
      }),
    [debouncedValidation, setMessage]
  );
  const reportValidity = useCallback<() => void>(() => {
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
  }, [reportValidity]);
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
