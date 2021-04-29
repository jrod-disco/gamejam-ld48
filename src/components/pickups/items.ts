import { FuelConfig, OxygenConfig } from '@src/constants';

export enum PICKUP_TYPES {
  OXYGEN = 'OXYGEN',
  FUEL = 'FUEL',
}

export type PickupConfig = {
  type: PICKUP_TYPES;
  quantity: number;
  poolCount: number;
  sound: string;
};

export const getConfig = (type: string): PickupConfig => {
  switch (type) {
    case PICKUP_TYPES.OXYGEN:
      return OxygenConfig;
    default:
      return FuelConfig;
  }
};
