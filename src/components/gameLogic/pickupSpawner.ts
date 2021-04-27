import { PICKUPS_MAX, PICKUP_SPAWN_RATE } from '@src/constants';
import * as PIXI from 'pixi.js';

import { pickupTank, PickupTank } from '../pickups';

// TODO: type the pickupList
// type PickupList = Array<OxygenTank | FuelTank>;

export interface PickupSpawner {
  spawn: () => PickupTank | null;
  getPickups: () => PickupTank[];
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
    lastSpawnTime: Date.now(),
    pickupList: [],
    isLanding: false,
  };
  const initialState = { ...state };

  const { anims } = props;

  const pickupBuffer = 150; // px from center

  const spawn = (): PickupTank | null => {
    if (state.isLanding) return;

    if (state.lastSpawnTime + PICKUP_SPAWN_RATE > Date.now()) return;
    state.lastSpawnTime = Date.now();

    let pickup;
    if (PICKUPS_MAX === state.pickupList.length) {
      // Reached max spawned, recycle if pool contains an inactive pickup
      pickup = state.pickupList.find(
        (pickup: PickupTank): boolean => !pickup.isActive()
      );
    } else {
      pickup = pickupTank({
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

  const getPickups = () => state.pickupList;

  const removePickupByIndex = (index: number): void => {
    state.pickupList.splice(index, 1);
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    console.log('pickup spawner reset');
    state.pickupList.forEach((pickup: PickupTank) => pickup.reset)
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
