/**
 * "Clamp" a value within a min/max range, ensuring it is within
 * the range.
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}
