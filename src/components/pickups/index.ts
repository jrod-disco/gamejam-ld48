import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound';

//import gsap, { Power0, Bounce } from 'gsap';
import { positionUsingDepth } from '@src/util/positionUsingDepth';
import {
  APP_HEIGHT,
  APP_WIDTH,
  LAYER_SPACING,
  LAYER_START_SCALE,
  SPEED_ITEM,
  MAX_PICKUP_SCALE,
  ROT_PICKUP_INCREMENT,
  MAX_LAYER_DEPTH,
  SFX_VOL_MULT,
  PICKUP_HIT_HI,
  PICKUP_HIT_LO,
} from '@src/constants';
import { getPickupType, PICKUP_TYPES } from './items';

export interface PickupItem {
  container: PIXI.Container;
  getResource: () => number;
  getType: () => PICKUP_TYPES;
  reset: () => void;
  update: (delta: number) => void;
  getScale: () => number;
  isActive: () => boolean;
  setActive: (active: boolean) => void;
  handleCollision: () => void;
}

interface PickupItemProps {
  pos?: { x: number; y: number };
  anims?: { [key: string]: Array<PIXI.Texture> };
  depth?: number;
  pickupBuffer: number;
  lowerContainer: PIXI.Container;
  upperContainer: PIXI.Container;
}

type PickupState = {
  endPosX: number;
  endPosY: number;
  scale: number;
  depth: number;
  active: boolean;
  // Composite from PickupType
  type?: PICKUP_TYPES;
  quantity?: number;
  sound?: string;
  animName?: string;
};

/**
 * pickup item - oxygen, replenishes player.oxygen
 *
 * @returns Interface object
 */
export const pickupItem = (props: PickupItemProps): PickupItem => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const pixiSound = PIXISOUND.default;
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;
  container.name = 'PickupItem';

  const { anims, pickupBuffer } = props;
  let state: PickupState = {
    endPosX: APP_WIDTH / 2,
    endPosY: APP_HEIGHT / 2,
    scale: LAYER_START_SCALE,
    depth: props.depth,
    active: false,
    ...getPickupType(),
  };
  // capture initial state
  const initialState = { ...state };

  // augement with random type, we'll do this again on reset
  //state = { ...state, ...getPickupType() };

  const setDestinationPostion = (): void => {
    state.endPosX =
      APP_WIDTH / 2 + (Math.random() * pickupBuffer * 2 - pickupBuffer);
    state.endPosY =
      APP_HEIGHT / 2 + (Math.random() * pickupBuffer * 2 - pickupBuffer);
  };

  /////////////////////////////////////////////////////////////////////////////
  // SPRITES
  const sprite = new PIXI.AnimatedSprite(anims[state.animName]);
  sprite.animationSpeed = 0.25;
  sprite.loop = true;
  sprite.anchor.set(0.5);
  sprite.play();

  container.addChild(sprite);
  container.pivot.set(0.5);

  const getType = (): PICKUP_TYPES => state.type;
  const getResource = (): number => state.quantity;

  const handleCollision = (): void => {
    if (state.sound) {
      pixiSound.play(state.sound, {
        volume: 1 * SFX_VOL_MULT,
      });
    }
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };

    props.lowerContainer.addChild(container);

    container.alpha = 0;
    container.scale.set(LAYER_START_SCALE);
    container.rotation = Math.random() * 360;

    setDestinationPostion();
    positionUsingDepth(container, state.endPosX, state.endPosY, state.depth);
  };
  reset();

  const isActive = (): boolean => state.active;
  const setActive = (active: boolean): void => {
    state.active = active;
  };
  const getScale = (): number => state.scale;

  const update = (delta: number): void => {
    if (!isActive()) return;

    if (state.scale >= MAX_PICKUP_SCALE) {
      reset();
    } else {
      state.scale += SPEED_ITEM * delta;
      state.depth = (getScale() - LAYER_START_SCALE) / LAYER_SPACING;
      container.rotation += ROT_PICKUP_INCREMENT;
      positionUsingDepth(container, state.endPosX, state.endPosY, state.depth);
      container.scale.set(getScale());
      if (getScale() < PICKUP_HIT_LO) {
        container.alpha = state.depth / MAX_LAYER_DEPTH;
      } else if (getScale() > PICKUP_HIT_LO && getScale() < PICKUP_HIT_HI) {
        container.alpha = 1;
      } else if (container.parent !== props.upperContainer) {
        container.alpha = 0.25;
        props.upperContainer.addChild(container);
      }
    }
  };

  return {
    container,
    reset,
    update,
    getResource,
    getType,
    getScale,
    isActive,
    setActive,
    handleCollision,
  };
};
