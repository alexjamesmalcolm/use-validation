import {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  PropsWithChildren,
} from "react";

type ValidationResponse = string | boolean;
export type Validator<Value extends unknown = string> = (
  value: Value
) => ValidationResponse | Promise<ValidationResponse>;

const style = { display: "contents" };

interface Options<Value extends unknown = string> {
  debounceWait?: number;
  getValueFromInput?: (input: HTMLInputElement) => Value;
  getInputFromWrapper?: (wrapper: HTMLDivElement) => HTMLInputElement;
}

type ValidationComponent = ({ children }: PropsWithChildren<{}>) => JSX.Element;

const useValidation = <Value extends unknown = string>(
  validator: Validator<Value>,
  options: Options<Value> = {}
): ValidationComponent => {
  const parent = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<number>(0);
  const debounceWait = useMemo(
    () => options.debounceWait || 0,
    [options.debounceWait]
  );
  const getValueFromInput = useMemo(
    () =>
      options.getValueFromInput ||
      ((input: HTMLInputElement) => input.value as Value),
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
    window.clearTimeout(timeoutId.current);
    const validatorFunc = (resolve: Resolve) => {
      actOnInput((input) => resolve(validator(getValueFromInput(input))));
    };
    if (debounceWait === 0) {
      return validatorFunc;
    }
    return (resolve) => {
      window.clearTimeout(timeoutId.current);
      timeoutId.current = window.setTimeout(() => {
        validatorFunc(resolve);
      }, debounceWait);
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
  return useCallback<ValidationComponent>(
    ({ children }) => (
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
