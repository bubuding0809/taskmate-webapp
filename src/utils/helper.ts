// Used to handle conditional class names
// Usage: <div className={classNames("text-red-500", "text-lg", "font-bold", "text-center")}></div>
export function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
