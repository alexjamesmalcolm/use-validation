import {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  PropsWithChildren,
} from "react";

interface ValidResponse {
  isValid: true;
}
interface InvalidResponse {
  isValid: false;
  errorMessage?: string;
}

export type ValidationResponse = ValidResponse | InvalidResponse;

export type Validator<Value extends unknown = string> = (
  value: Value
) => ValidationResponse | Promise<ValidationResponse>;

const style = { display: "contents" };

export interface CacheOptions<Value extends unknown> {
  getCache: (value: Value) => ValidationResponse | undefined;
  setCache: (value: Value, validationResponse: ValidationResponse) => void;
}

interface Options<Value extends unknown = string> {
  debounceWait?: number;
  cache?: CacheOptions<Value>;
  getValueFromInput?: (input: FormField) => Value;
  getInputFromWrapper?: (wrapper: HTMLDivElement) => FormField;
  genericInvalidMessage?: string;
}

type ValidationComponent = ({ children }: PropsWithChildren<{}>) => JSX.Element;

type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const isFormField = (element: Element): element is FormField =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement;

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
      options.getValueFromInput || ((input: FormField) => input.value as Value),
    [options.getValueFromInput]
  );
  const getInput = useCallback((): FormField | undefined => {
    if (parent.current) {
      if (options.getInputFromWrapper) {
        return options.getInputFromWrapper(parent.current);
      }
      const element = parent.current.children[0];
      if (element && isFormField(element)) return element;
    }
  }, [options]);
  const setMessage = useCallback(
    (message: string) => {
      const input = getInput();
      if (input) {
        input.setCustomValidity(message);
      }
    },
    [getInput]
  );
  type Resolve = (
    value: ValidationResponse | PromiseLike<ValidationResponse>
  ) => void;
  const debouncedValidation = useMemo<(resolve: Resolve) => void>(() => {
    window.clearTimeout(timeoutId.current);
    const validatorFunc = (resolve: Resolve) => {
      const input = getInput();
      if (input) {
        const value = getValueFromInput(input);
        resolve(validator(value));
      }
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
  }, [debounceWait, getInput, getValueFromInput, validator]);

  const checkCache = useCallback(() => {
    if (options.cache) {
      const input = getInput();
      if (input) {
        return options.cache.getCache(getValueFromInput(input));
      }
    }
  }, [getInput, getValueFromInput, options]);

  const checkValidity = useCallback(():
    | ValidationResponse
    | Promise<ValidationResponse> => {
    const cachedValidation = checkCache();
    if (cachedValidation !== undefined) {
      return cachedValidation;
    }
    return new Promise<ValidationResponse>((resolve) => {
      setMessage("Validating...");
      debouncedValidation(resolve);
    }).then((validationResponse) => {
      if (options.cache) {
        const input = getInput();
        if (input) {
          const value = getValueFromInput(input);
          options.cache.setCache(value, validationResponse);
        }
      }
      return validationResponse;
    });
  }, [
    checkCache,
    debouncedValidation,
    getInput,
    getValueFromInput,
    options.cache,
    setMessage,
  ]);

  const getErrorMessage = useCallback(
    (validationResponse: ValidationResponse): string =>
      validationResponse.isValid
        ? ""
        : validationResponse.errorMessage ||
          options.genericInvalidMessage ||
          "Invalid",
    [options]
  );

  const reportValidity = useCallback(
    async () => setMessage(getErrorMessage(await checkValidity())),
    [checkValidity, getErrorMessage, setMessage]
  );

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
