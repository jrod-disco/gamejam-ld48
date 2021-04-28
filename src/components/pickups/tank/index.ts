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
  PICKUP_TYPES,
  PICKUP_OXYGEN_TANK_QUANTITY,
  PICKUP_FUEL_TANK_QUANTITY,
  PICKUP_OXY_WEIGHT,
} from '@src/constants';

export interface PickupTank {
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

interface PickupTankProps {
  pos?: { x: number; y: number };
  anims?: { [key: string]: Array<PIXI.Texture> };
  depth?: number;
  pickupBuffer: number;
  lowerContainer: PIXI.Container;
  upperContainer: PIXI.Container;
}

type PickupType = {
  type: PICKUP_TYPES;
  quantity: number;
  sound: string;
};

type PickupState = {
  endPosX: number;
  endPosY: number;
  scale: number;
  depth: number;
  active: boolean;
  type?: PICKUP_TYPES;
  quantity?: number;
  sound?: string;
};

/**
 * pickup item - oxygen, replenishes player.oxygen
 *
 * @returns Interface object
 */
export const pickupTank = (props: PickupTankProps): PickupTank => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const pixiSound = PIXISOUND.default;
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;
  container.name = 'pickuptank';

  // resolve random pickup type for single pickup class
  const getPickupType = (): PickupType => {
    let type: PICKUP_TYPES;
    let quantity: number;
    let sound: string;

    const ran = Math.random() * 100;
    if (ran < PICKUP_OXY_WEIGHT) {
      type = PICKUP_TYPES.OXYGEN;
      quantity = PICKUP_OXYGEN_TANK_QUANTITY;
      sound = 'pickup_1';
    } else {
      type = PICKUP_TYPES.FUEL;
      quantity = PICKUP_FUEL_TANK_QUANTITY;
      sound = 'pickup_2';
    }

    return {
      type,
      quantity,
      sound,
    };
  };

  const { anims, pickupBuffer } = props;
  let state: PickupState = {
    endPosX: APP_WIDTH / 2,
    endPosY: APP_HEIGHT / 2,
    scale: LAYER_START_SCALE,
    depth: props.depth,
    active: false,
  };
  // capture initial state
  const initialState = { ...state };

  // augement with random type, we'll do this again on reset
  state = { ...state, ...getPickupType() };

  const setDestinationPostion = (): void => {
    state.endPosX =
      APP_WIDTH / 2 + (Math.random() * pickupBuffer * 2 - pickupBuffer);
    state.endPosY =
      APP_HEIGHT / 2 + (Math.random() * pickupBuffer * 2 - pickupBuffer);
  };

  /////////////////////////////////////////////////////////////////////////////
  // SPRITES
  const spriteContainer = new PIXI.Container();
  container.addChild(spriteContainer);
  container.pivot.set(0.5);

  const oxySprite = new PIXI.AnimatedSprite(anims['oxy']);
  oxySprite.animationSpeed = 0.25;
  oxySprite.loop = true;
  oxySprite.anchor.set(0.5);
  oxySprite.play();

  const fuelSprite = new PIXI.AnimatedSprite(anims['fuel']);
  fuelSprite.animationSpeed = 0.25;
  fuelSprite.loop = true;
  fuelSprite.anchor.set(0.5);
  fuelSprite.play();

  const updateSpriteContainer = (): void => {
    spriteContainer.removeChildren();
    switch (state.type) {
      case PICKUP_TYPES.OXYGEN:
        spriteContainer.addChild(oxySprite);
        break;
      case PICKUP_TYPES.FUEL:
        spriteContainer.addChild(fuelSprite);
        break;
      default:
        console.warn(
          'pickup: what kind of sprite are you even trying to add state: %o',
          state
        );
    }
  };

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
    state = { ...initialState, ...getPickupType() };
    updateSpriteContainer();

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
