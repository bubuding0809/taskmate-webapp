import { Dispatch, useEffect, useState } from "react";

type UseDebounceType = <T>(value: T, delay?: number) => [T, Dispatch<T>, T];

const useDebouceQuery: UseDebounceType = (value, delay) => {
  const [liveValue, setLiveValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(liveValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(liveValue);
    }, delay || 500);

    return () => {
      clearTimeout(handler);
    };
  }, [liveValue, delay]);

  return [liveValue, setLiveValue, debouncedValue] as [
    typeof liveValue,
    typeof setLiveValue,
    typeof debouncedValue
  ];
};

export default useDebouceQuery;
