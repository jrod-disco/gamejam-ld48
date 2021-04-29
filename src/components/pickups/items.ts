import { FuelConfig, OxygenConfig } from '@src/constants';

export enum PICKUP_TYPES {
  OXYGEN = 'OXYGEN',
  FUEL = 'FUEL',
}

export type PickupConfig = {
  type: PICKUP_TYPES;   // type of the pickup
  quantity: number;     // amount awarded when collected
  poolCount: number;    // number of items to place in pool
  sound: string;        // name of the sound
  speed: number;        // scale increase per update()
};

export const getConfig = (type: string): PickupConfig => {
  switch (type) {
    case PICKUP_TYPES.OXYGEN:
      return OxygenConfig;
    default:
      return FuelConfig;
  }
};
