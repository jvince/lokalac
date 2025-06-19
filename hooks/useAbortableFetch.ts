import { useEffect, useRef, useState } from "preact/hooks";

interface AbortableFetchOptions<T> {
  defaultValue?: T | null;
  enabled?: boolean;
}

export function useAbortableFetch<T = unknown>(
  url: string,
  options?: AbortableFetchOptions<T>,
  requestOptions?: RequestInit,
): [T | null | undefined, boolean, Error | null] {
  const defaultOptions: AbortableFetchOptions<T> = {
    defaultValue: null,
    enabled: true,
  };

  const { defaultValue, enabled } = { ...defaultOptions, ...options };
  const controllerRef = useRef<AbortController | null>(null);

  const [data, setData] = useState<T | null | undefined>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    fetch(url, { ...requestOptions, signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (signal.aborted) {
          console.log("Fetch aborted");
        } else {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      controllerRef.current?.abort();
    };
  }, [url, requestOptions]);

  return [data, loading, error];
}
