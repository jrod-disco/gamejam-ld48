import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound';

//import gsap, { Power0, Bounce } from 'gsap';
import { positionUsingDepth } from '@src/util/positionUsingDepth';
import {
  APP_HEIGHT,
  APP_WIDTH,
  PICKUP_OXYGEN_TANK_QUANTITY,
  PICKUP_TYPES,
  LAYER_SPACING,
  LAYER_START_SCALE,
  SPEED_ITEM,
  MAX_PICKUP_SCALE,
  ROT_PICKUP_INCREMENT,
  MAX_LAYER_DEPTH,
  SFX_VOL_MULT,
  PICKUP_HIT_HI,
  THEME,
  PICKUP_HIT_LO,
} from '@src/constants';

export interface OxygenTank {
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

interface OxygenTankProps {
  pos?: { x: number; y: number };
  anims?: { [key: string]: Array<PIXI.Texture> };
  depth?: number;
  pickupBuffer: number;
  lowerContainer: PIXI.Container;
  upperContainer: PIXI.Container;
}

type OxygenTankPosition = { x: number; y: number };

/**
 * pickup item - oxygen, replenishes player.oxygen
 *
 * @returns Interface object
 */
export const oxygenTank = (props: OxygenTankProps): OxygenTank => {
  const pos = props.pos ?? { x: 0, y: 0 };

  const pixiSound = PIXISOUND.default;

  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;
  container.name = 'oxygenTank';

  const { anims, pickupBuffer } = props;

  let state = {
    endPosX: APP_WIDTH / 2,
    endPosY: APP_HEIGHT / 2,
    scale: LAYER_START_SCALE,
    depth: props.depth,
    active: false,
  };
  const initialState = { ...state };

  const setDestinationPostion = (): void => {
    state.endPosX =
      APP_WIDTH / 2 + (Math.random() * pickupBuffer * 2 - pickupBuffer);
    state.endPosY =
      APP_HEIGHT / 2 + (Math.random() * pickupBuffer * 2 - pickupBuffer);
  };

  const oxygenTankContainer = new PIXI.Container();
  container.addChild(oxygenTankContainer);
  container.pivot.set(0.5);

  // animated sprite
  // Spin animations
  const tankSprite = new PIXI.AnimatedSprite(anims['oxy']);
  tankSprite.animationSpeed = 0.25;
  tankSprite.loop = true;
  tankSprite.anchor.set(0.5);
  tankSprite.play();

  oxygenTankContainer.addChild(tankSprite);

  const getType = (): PICKUP_TYPES => PICKUP_TYPES.OXYGEN;
  const getResource = (): number => PICKUP_OXYGEN_TANK_QUANTITY;

  const handleCollision = (): void => {
    pixiSound.play('pickup_1', {
      volume: 1 * SFX_VOL_MULT,
    });
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
      }
      else if (getScale() > PICKUP_HIT_LO && getScale() < PICKUP_HIT_HI)
      {
        container.alpha = 1;
      }
      else if (container.parent !== props.upperContainer) {
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
