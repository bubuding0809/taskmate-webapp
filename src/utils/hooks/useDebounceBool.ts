/* DONE BY: Ding RuoQian 2100971 */

import { useEffect, useState } from "react";

export const useDebounceBool = (delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(true);

  useEffect(() => {
    // After delay, set debouncedValue back to True
    const handler = setTimeout(() => {
      setDebouncedValue(true);
    }, delay || 500);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedValue, delay]);

  return [debouncedValue, setDebouncedValue] as [
    typeof debouncedValue,
    typeof setDebouncedValue
  ];
};
