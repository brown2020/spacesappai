/**
 * Generate a consistent color from a string
 * Useful for assigning unique colors to users based on their email/id
 *
 * @param str - The input string to convert to a color
 * @returns A hex color string (e.g., "#A1B2C3")
 */
export default function stringToColor(str: string): string {
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to a 6-digit hex color
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();

  // Pad with zeros if needed
  return "#" + "0".repeat(6 - color.length) + color;
}

/**
 * Generate a color with specified lightness
 * Useful when you need colors that work well on specific backgrounds
 *
 * @param str - The input string
 * @param lightness - Target lightness (0-100)
 * @returns An HSL color string
 */
export function stringToHSLColor(str: string, lightness = 50): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 70; // Fixed saturation for vibrancy

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
