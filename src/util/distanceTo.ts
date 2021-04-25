import { Point2D } from '@src/constants';

/**
 * simple means to measure two points
 */
export const distanceTo2D = (start: Point2D, end: Point2D): number =>
  Math.hypot(end.x - start.x, end.y - start.y);

// OR
// var dist = Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
