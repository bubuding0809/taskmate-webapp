export const getLocalStorage = (
  key: string,
  defaultValue: any
): string | any => {
  const item = localStorage.getItem(key);
  if (item !== null) {
    return JSON.parse(item);
  } else {
    return defaultValue;
  }
};

export const setLocalStorage = (key: string, valuetoStore: any): void => {
  localStorage.setItem(key, JSON.stringify(valuetoStore));
};
