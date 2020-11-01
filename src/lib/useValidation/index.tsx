import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";

type ValidationResponse = string | boolean;
export type Validator = (
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
  const timeoutId = useRef<number>(0);
  const debounceWait = useMemo(() => options.debounceWait || 0, [
    options.debounceWait,
  ]);
  const getValueFromInput = useMemo(
    () =>
      options.getValueFromInput || ((input: HTMLInputElement) => input.value),
    [options.getValueFromInput]
  );
  const actOnInput = useCallback(
    (callback: (input: HTMLInputElement) => void) => {
      parent.current &&
        callback(
          (
            options.getInputFromWrapper ||
            ((wrapper: HTMLDivElement) =>
              wrapper.children[0] as HTMLInputElement)
          )(parent.current)
        );
    },
    [options.getInputFromWrapper]
  );
  const setMessage = useCallback(
    (message: string) => {
      actOnInput((input) => input.setCustomValidity(message));
    },
    [actOnInput]
  );
  type Resolve = (value?: unknown) => void;
  const debouncedValidation = useMemo<(resolve: Resolve) => void>(() => {
    clearTimeout(timeoutId.current);
    const validatorFunc = (resolve: Resolve) => {
      actOnInput((input) => resolve(validator(getValueFromInput(input))));
    };
    if (debounceWait === 0) {
      return validatorFunc;
    }
    return (resolve) => {
      clearTimeout(timeoutId.current);
      timeoutId.current = (setTimeout(() => {
        validatorFunc(resolve);
      }, debounceWait) as unknown) as number;
    };
  }, [actOnInput, debounceWait, getValueFromInput, validator]);
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
    reportValidityRef.current = reportValidity;
  }, [reportValidity]);
  const reportValidityRef = useRef(reportValidity);
  return useCallback(
    ({ children }: { children: ReactNode }) => (
      <div
        onChangeCapture={reportValidityRef.current}
        ref={parent}
        style={style}
      >
        {children}
      </div>
    ),
    []
  );
};

export default useValidation;
