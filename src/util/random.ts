/**
 * get random int between min / max
 * @param min
 * @param max
 */
export const randomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * get random float between min / max
 * @param min
 * @param max
 */
export const randomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};
