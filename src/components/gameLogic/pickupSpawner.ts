import * as PIXI from 'pixi.js';
import {
  PICKUP_SPAWN_RATE_MIN,
  PICKUP_SPAWN_RATE_MAX,
  OxygenConfig,
  FuelConfig,
} from '@src/constants';
import { randomInteger } from '@src/util/random';

import { pickupItem, PickupItem } from '../pickups';
import { shuffle } from '@src/util/shuffle';
import { PickupConfig } from '../pickups/items';

// TODO: type the pickupList
type PickupList = Array<PickupItem>;

export interface PickupSpawner {
  spawn: () => PickupItem | null;
  getPickups: () => PickupItem[];
  removePickupByIndex: (index: number) => void;
  reset: () => void;
  startLanding: () => void;
}

interface PickupSpawnerProps {
  anims?: { [key: string]: Array<PIXI.Texture> };
  pickupContainerLower: PIXI.Container;
  pickupContainerUpper: PIXI.Container;
}

const createPool = (props: PickupSpawnerProps): PickupItem[] => {
  const items: PickupItem[] = [];
  
  const {
    anims,
    pickupContainerLower,
    pickupContainerUpper
  } = props;

  [OxygenConfig, FuelConfig].forEach((config: PickupConfig): void => {
    const pickup = pickupItem({
      anims,
      depth: 0,
      lowerContainer: pickupContainerLower,
      upperContainer: pickupContainerUpper,
      config
    });
    for (let i = 0; i < config.poolCount; i++) {
      items.push(pickup);
    }
  });

  return shuffle<PickupItem>(items);
}

export const pickupSpawner = (props: PickupSpawnerProps): PickupSpawner => {
  let state = {
    nextSpawnTime: Date.now(),
    pickupList: createPool(props),
    isLanding: false,
  };
  const initialState = { ...state };

  const spawn = (): PickupItem | null => {
    if (state.isLanding) return;
    if (Date.now() < state.nextSpawnTime) return;

    state.nextSpawnTime =
      Date.now() + randomInteger(PICKUP_SPAWN_RATE_MIN, PICKUP_SPAWN_RATE_MAX);

    // Reached max spawned, recycle if pool contains an inactive pickup
    // this requires the pool to be larger than the number of possible 
    // active pickups. A larger number also improves randomess ratios.
    let pickup: PickupItem = null;
    while (pickup == null) {
      const i: number = randomInteger(0, state.pickupList.length - 1);
      pickup = state.pickupList[i];
      if (pickup.isActive()) {
        pickup = null;
      }
    }

    pickup.setActive(true);
    return pickup;
  };

  const getPickups = (): PickupList => state.pickupList;

  const removePickupByIndex = (index: number): void => {
    state.pickupList.splice(index, 1);
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    console.log('pickup spawner reset');
    state.pickupList.forEach((pickup: PickupItem) => pickup.reset);
    state = { ...initialState };
    state.pickupList = shuffle<PickupItem>(state.pickupList);
  };
  reset();

  const startLanding = (): void => {
    state.isLanding = true;
  };

  return {
    spawn,
    getPickups,
    removePickupByIndex,
    reset,
    startLanding,
  };
};
