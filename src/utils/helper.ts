// Used to handle conditional class names
// Usage: <div className={classNames("text-red-500", "text-lg", "font-bold", "text-center")}></div>
export function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date): string {
  // Extract and format time of the date object
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    })
    .toLowerCase();

  // If the date is today, return "Today, Time"
  if (date.toDateString() === new Date().toDateString()) {
    return `Today, ${time}`;
  }

  // Else return the date in the format "DayOfWeek, Day Month, Time"
  const dayOfWeekName = date.toLocaleDateString("en-US", {
    weekday: "short",
  });
  const monthName = date.toLocaleDateString("en-US", {
    month: "short",
  });
  const day = date.getDate();

  return `${dayOfWeekName}, ${day} ${monthName}, ${time}`;
}
