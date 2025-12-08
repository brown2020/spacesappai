/**
 * Generate a consistent, accessible color from a string
 * Useful for assigning unique colors to users based on their email/id
 * 
 * The generated colors have controlled saturation and lightness to ensure
 * they are visible on both light and dark backgrounds.
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

  // Use HSL for better control over accessibility
  const hue = Math.abs(hash) % 360;
  const saturation = 65; // Good saturation for visibility
  const lightness = 45; // Mid-range lightness for contrast on both light/dark backgrounds

  // Convert HSL to hex for broader compatibility
  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL values to hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generate a color with specified lightness
 * Useful when you need colors that work well on specific backgrounds
 *
 * @param str - The input string
 * @param lightness - Target lightness (0-100), defaults to 45 for good contrast
 * @returns An HSL color string
 */
export function stringToHSLColor(str: string, lightness = 45): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 65; // Good saturation for visibility

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
