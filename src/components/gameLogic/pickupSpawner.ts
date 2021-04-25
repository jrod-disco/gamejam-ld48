import {
  APP_HEIGHT,
  APP_WIDTH,
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

export const pickupSpawner = (): PickupSpawner => {
  let state = {
    lastSpawnTime: Date.now(),
    pickupList: [],
  };
  const initialState = { ...state };

  const pickupBuffer = 50;

  const spawn = (): OxygenTank | null => {
    if (state.lastSpawnTime + PICKUP_SPAWN_RATE > Date.now()) return;
    state.lastSpawnTime = Date.now();

    if (state.pickupList.length > PICKUPS_MAX - 1) return;

    const rX =
      pickupBuffer / 2 + Math.floor(Math.random() * (APP_WIDTH - pickupBuffer));
    const rY =
      pickupBuffer / 2 +
      Math.floor(Math.random() * (APP_HEIGHT - pickupBuffer));

    // TODO:
    // - abstract this so that we can support many pickup types

    const texture = PIXI.Texture.from('./assets/example/goldbox.png');
    const pickup = oxygenTank({
      pos: { x: rX, y: rY },
      textures: { nuggetTexture: texture },
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
