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
