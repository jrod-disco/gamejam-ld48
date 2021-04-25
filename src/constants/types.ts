import { PICKUP_TYPES } from './game';

/**
 * pickup / item resource
 */
export interface Resource {
  getType: () => PICKUP_TYPES;
  getResource: () => number;
}

/**
 * simple coordinates
 */
export type Point2D = {
  x: number;
  y: number;
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};
