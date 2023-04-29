/* DONE BY: Ding RuoQian 2100971 */

import { Dispatch, useEffect, useState } from "react";

type UseDebounceType = <T>(
  value: T,
  delay?: number,
  onDebouncedChange?: (value: T) => void
) => [T, Dispatch<T>, T];

const useDebouceQuery: UseDebounceType = (value, delay, onDebouncedChange) => {
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

  // Callback to execute when debounced value changes
  useEffect(() => {
    onDebouncedChange && onDebouncedChange(debouncedValue);
  }, [debouncedValue]);

  return [liveValue, setLiveValue, debouncedValue] as [
    typeof liveValue,
    typeof setLiveValue,
    typeof debouncedValue
  ];
};

export default useDebouceQuery;
