import * as PIXI from 'pixi.js';
import {
  PICKUPS_MAX,
  PICKUP_SPAWN_RATE_MIN,
  PICKUP_SPAWN_RATE_MAX,
} from '@src/constants';
import { randomInteger } from '@src/util/random';

import { pickupItem, PickupItem } from '../pickups';

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

export const pickupSpawner = (props: PickupSpawnerProps): PickupSpawner => {
  let state = {
    nextSpawnTime: Date.now(),
    pickupList: [],
    isLanding: false,
  };
  const initialState = { ...state };

  const { anims } = props;

  const pickupBuffer = 150; // px from center

  const spawn = (): PickupItem | null => {
    if (state.isLanding) return;
    if (Date.now() < state.nextSpawnTime) return;
    state.nextSpawnTime =
      Date.now() + randomInteger(PICKUP_SPAWN_RATE_MIN, PICKUP_SPAWN_RATE_MAX);

    let pickup;
    if (PICKUPS_MAX === state.pickupList.length) {
      // Reached max spawned, recycle if pool contains an inactive pickup
      pickup = state.pickupList.find(
        (pickup: PickupItem): boolean => !pickup.isActive()
      );
    } else {
      pickup = pickupItem({
        pickupBuffer,
        anims,
        depth: 0,
        lowerContainer: props.pickupContainerLower,
        upperContainer: props.pickupContainerUpper,
      });
      state.pickupList.push(pickup);
    }

    pickup && pickup.setActive(true);
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
    state = { ...initialState, pickupList: [] };
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
