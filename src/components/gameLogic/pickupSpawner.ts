import {
  PICKUPS_MAX,
  PICKUP_SPAWN_RATE,
} from '@src/constants';
import * as PIXI from 'pixi.js';

import { oxygenTank, OxygenTank } from '../pickups';

export interface PickupSpawner {
  spawn: () => OxygenTank | null;
  getPickups: () => OxygenTank[];
  removePickupByIndex: (index: number) => void;
  reset: () => void;
}

interface PickupSpawnerProps {
  anims?: { [key: string]: Array<PIXI.Texture> };
}

export const pickupSpawner = (props: PickupSpawnerProps): PickupSpawner => {
  let state = {
    lastSpawnTime: Date.now(),
    pickupList: [],
  };
  const initialState = { ...state };

  const { anims } = props;

  const pickupBuffer = 50;

  const spawn = (): OxygenTank | null => {
    if (PICKUPS_MAX === state.pickupList.length) return;

    if (state.lastSpawnTime + PICKUP_SPAWN_RATE > Date.now()) return;
    state.lastSpawnTime = Date.now();

    const pickup = oxygenTank({
      pickupBuffer,
      anims,
      depth: 0,
    });

    state.pickupList.push(pickup);
    return pickup;
  };

  const getPickups = (): OxygenTank[] => state.pickupList;

  const removePickupByIndex = (index: number): void => {
    state.pickupList.splice(index, 1);
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    console.log('pickup spawner reset');

    state = { ...initialState, pickupList: [] };
  };
  reset();

  return {
    spawn,
    getPickups,
    removePickupByIndex,
    reset,
  };
};
