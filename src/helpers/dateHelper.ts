// utils/formatDate.ts
export function formatDate(dateString: string): string {
  const givenDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Check if the date is today
  if (
    givenDate.getFullYear() === today.getFullYear() &&
    givenDate.getMonth() === today.getMonth() &&
    givenDate.getDate() === today.getDate()
  ) {
    return "Today";
  }

  // Check if the date is yesterday
  if (
    givenDate.getFullYear() === yesterday.getFullYear() &&
    givenDate.getMonth() === yesterday.getMonth() &&
    givenDate.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }

  // Check if the date is in the current year
  if (givenDate.getFullYear() === today.getFullYear()) {
    return givenDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }); // e.g., "07 Dec"
  }

  // Default: Return the full date with year
  return givenDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // e.g., "07 Dec 2024"
}

export function convertDateTime(dateTimeString: string): string {
  console.log(dateTimeString, "dateTimeString");
  // Parse the input date string manually
  const [datePart, timePart] = dateTimeString.split(" ");
  const [year, month, day] = datePart.split("-");
  let [hour] = timePart.split(":").map(Number);
  const [minute] = timePart.split(":").map(Number);

  // Convert to 12-hour format
  let period = "AM";
  if (hour >= 12) {
    period = "PM";
    if (hour > 12) {
      hour -= 12;
    }
  } else if (hour === 0) {
    hour = 12;
  }

  // Ensure two-digit formatting for day, month, hour, and minute
  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;
  const formattedTime = `${String(hour).padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;

  return `${formattedDate} ${formattedTime}`;
}

export const formatToDateTime = (dateString: string): string => {
  let parsedDate: Date;

  // Check if date is in dd-mm-yyyy or dd/mm/yyyy format
  const match = dateString.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    parsedDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  } else {
    // Try standard parsing (for ISO or already-valid formats)
    parsedDate = new Date(dateString);
  }

  if (isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  const hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();

  // Check if time was included in input string
  const hasTime = !(hours === 0 && minutes === 0);

  if (!hasTime) {
    return `${year}-${month}-${day}`;
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  let displayHours = hours % 12;
  displayHours = displayHours ? displayHours : 12;

  const formattedTime = `${String(displayHours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")} ${ampm}`;

  return `${year}-${month}-${day} ${formattedTime}`;
};
