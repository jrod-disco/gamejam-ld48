import { PICKUP_TYPES } from './game';

export interface Resource {
  getType: () => PICKUP_TYPES;
  getResource: () => number;
}
