export interface Vector {
  x: number;
  y: number;
}

export const ZERO_VECTOR: Vector = { x: 0, y: 0 };

/**
 * Get the angle of a vector in radians, with `0` pointing
 * straight up.  A fallback value can be used when the vector
 * has no angle.
 *
 * @returns The vector angle, or null if a zero vector
 */
export function getAngle(
  v: Vector,
  fallback: number | null = null
): number | null {
  const { x, y } = v;
  const rad = Math.PI / 2;
  if (y === 0) {
    return x < 0 ? -rad : x > 0 ? rad : fallback;
  }
  const angle = Math.atan(x / -y);
  return y > 0 ? angle + Math.PI : angle;
}

/**
 * Given an angle and a target angle, get the change in rotation needed to
 * rotate to the target with the smallest rotation.
 */
export function getShortestAngleDifference(
  angle: number,
  target: number
): number {
  const deltaLeft = target - angle;
  const deltaRight = target - (angle + Math.PI * 2);

  let delta: number;

  if (Math.abs(deltaLeft) < Math.abs(deltaRight)) {
    delta = deltaLeft;
  } else {
    delta = deltaRight;
  }

  return delta;
}

/**
 * Get the magnitude (length) of a vector
 */
export function getMagnitude(v: Vector): number {
  const { x, y } = v;

  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

/**
 * Create a copy of this vector with the same angle and
 * the requested magnitude.
 */
export function withMagnitude(v: Vector, m: number): Vector {
  const { x, y } = v;
  const currentMag = getMagnitude(v);

  const magnitudeRatio = currentMag / m;

  return {
    x: x * magnitudeRatio,
    y: y * magnitudeRatio,
  };
}

/**
 * Return the unit vector (a vector with the same angle but
 * a magnitude of 1) for a given vector input.
 *
 * The only exception is: if the input is a zero vector, this
 * returns the same zero vector.
 */
export function getUnitVector(v: Vector): Vector {
  const { x, y } = v;
  if (x === 0 && y === 0) {
    return v;
  }
  const magnitude = getMagnitude(v);

  return {
    x: x / magnitude,
    y: y / magnitude,
  };
}

/**
 * Multiply a vector by a scalar value.  E.g. to cut a vector in half,
 * call `vScale(myVector, 0.5)`
 */
export function vScale(v: Vector, s: number): Vector {
  const { x, y } = v;

  return {
    x: x * s,
    y: y * s,
  };
}

/**
 * Determine whether the magnitude of a vector is greater than, equal to,
 * or less than a given magnitude.
 *
 * NOTE: This is more efficient than calling `getMagnitude` and running a
 * comparison, because it avoids extra (costly) square root math calls.
 * Preferable when e.g. checking distances between many things.
 * @param v
 * @param m
 * @returns -1 if the vector magnitude is less than the target, 0 if equal, 1 if greater
 */
export function compareMagnitude(v: Vector, m: number): number {
  const { x, y } = v;
  const squaredMagnitude = Math.pow(x, 2) + Math.pow(y, 2);
  const squaredTarget = Math.pow(m, 2);

  return squaredMagnitude < squaredTarget
    ? -1
    : squaredMagnitude > squaredTarget
    ? 1
    : 0;
}

/**
 * Return a new vector that represents the sum of all
 * provided vectors.
 */
export function vAdd(...vectors: Vector[]): Vector {
  return {
    x: vectors.map((v) => v.x).reduce((x1, x2) => x1 + x2),
    y: vectors.map((v) => v.y).reduce((y1, y2) => y1 + y2),
  };
}

/**
 * Return a new vector that represents the subtraction of all
 * provided vectors from left to right, e.g. v1 - v2 - v3 - ... - vn
 */
export function vSubtract(...vectors: Vector[]): Vector {
  return {
    x: vectors.map((v) => v.x).reduce((x1, x2) => x1 - x2),
    y: vectors.map((v) => v.y).reduce((y1, y2) => y1 - y2),
  };
}
