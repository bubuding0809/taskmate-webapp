/* DONE BY: Ding RuoQian 2100971 */

// Used to handle conditional class names
// Usage: <div className={classNames("text-red-500", "text-lg", "font-bold", "text-center")}></div>
/**
  @param {string[]} classes - An array of class names to conditionally add to the element
  @returns {string} The class names to add to the element
**/
export function classNames(...classes: (string | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

// This helper function is used to format a date object into a string
// The function will return a string representing the date in the format "Today, Time" if the date is today
// Else it will return a string representing the date in the format "DayOfWeek, Day Month, Time"
/**
  @param {Date} date - The date object to format
  @returns {string} The formatted date string
**/
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

// This helper function is used to trim a string from the beginning and end of the string
// Users can specify which characters to trim from the string
/**
  @param {string[]} characters - An array of characters to trim from the string
  @param {string} str - The string to trim
  @returns {string} The trimmed string
**/
export function trimChar(characters: string[], str: string): string {
  const regex = new RegExp(
    `^[${characters.join("")}]+|[${characters.join("")}]+$`,
    "g"
  );
  return str.replace(regex, "");
}
