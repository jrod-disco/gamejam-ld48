import {
  PICKUP_OXYGEN_TANK_QUANTITY,
  PICKUP_FUEL_TANK_QUANTITY,
  PICKUP_OXY_WEIGHT,
} from '@src/constants';

export enum PICKUP_TYPES {
  OXYGEN = 'OXYGEN',
  FUEL = 'FUEL',
}

export interface Resource {
  getType: () => PICKUP_TYPES;
  getResource: () => number;
}

type PickupType = {
  type: PICKUP_TYPES;
  quantity: number;
  sound: string;
  animName: string;
};

const OxygenType: PickupType = {
  type: PICKUP_TYPES.OXYGEN,
  quantity: PICKUP_OXYGEN_TANK_QUANTITY,
  sound: 'pickup_1',
  animName: 'oxy',
}

const FuelType: PickupType = {
  type: PICKUP_TYPES.FUEL,
  quantity: PICKUP_FUEL_TANK_QUANTITY,
  sound: 'pickup_2',
  animName: 'fuel',
}

export const getPickupType = (): PickupType => {
  if (Math.random() < PICKUP_OXY_WEIGHT) {
    return OxygenType;
  }
  
  return FuelType;
};
