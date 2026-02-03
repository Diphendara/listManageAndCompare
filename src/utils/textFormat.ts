/**
 * Text formatting utilities.
 */

/**
 * Converts a string to title case (first letter of each word capitalized).
 * Example: "card name" => "Card Name"
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
