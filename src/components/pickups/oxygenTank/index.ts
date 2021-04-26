import * as PIXI from 'pixi.js';
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
  MAX_LAYER_SCALE,
  MAX_LAYER_DEPTH,
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
}

interface OxygenTankProps {
  pos?: { x: number; y: number };
  anims?: { [key: string]: Array<PIXI.Texture> };
  depth?: number;
  pickupBuffer: number;
}

type OxygenTankPosition = { x: number; y: number };

/**
 * pickup item - oxygen, replenishes player.oxygen
 *
 * @returns Interface object
 */
export const oxygenTank = (props: OxygenTankProps): OxygenTank => {
  const pos = props.pos ?? { x: 0, y: 0 };

  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;
  container.name = 'oxygenTank';

  const { anims } = props;

  let state = {
    endPosX: APP_WIDTH/2,
    endPosY: APP_HEIGHT/2,
    scale: LAYER_START_SCALE,
    depth: props.depth,
    active: false,
  };
  const initialState = { ...state };

  const setDestinationPostion = (): void => {
    state.endPosX = props.pickupBuffer/2 + Math.floor(Math.random() * (APP_WIDTH - props.pickupBuffer));
    state.endPosY = props.pickupBuffer/2 + Math.floor(Math.random() * (APP_HEIGHT - props.pickupBuffer));
  }

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

  // ANIMATION
  // const grow = (): void => {
  //   gsap.killTweensOf(tankSprite);
  //   const myTween = gsap.to(tankSprite, {
  //     duration: 0.75,
  //     pixi: { scale: 1 },
  //     ease: Bounce.easeOut,
  //   });

  //   const myTweenAlpha = gsap.to(tankSprite, {
  //     duration: 0.5,
  //     pixi: { alpha: 1 },
  //     ease: Power0.easeOut,
  //   });
  // };
  // grow();

  // RESOURCE
  const getType = (): PICKUP_TYPES => {
    return PICKUP_TYPES.OXYGEN;
  };

  const getResource = (): number => {
    return PICKUP_OXYGEN_TANK_QUANTITY;
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    //tankSprite.tint = getDepthColor();
    container.scale.set(LAYER_START_SCALE);
    container.rotation = Math.random() * 360;
    setDestinationPostion();
    positionUsingDepth(container, state.endPosX, state.endPosY, state.depth);
  };
  reset();

  const isActive = (): boolean => state.active;
  const setActive = (active: boolean): void => { 
    state.active = active;
  }

  const getScale = (): number => state.scale;

  const update = (delta: number): void => {
    if (!isActive()) return;

    if (state.scale >= MAX_PICKUP_SCALE) {
      reset();
      container.alpha = 0;
    } else {
      //sprite.tint = getDepthColor();
      container.alpha = state.depth / MAX_LAYER_DEPTH;
      state.scale += SPEED_ITEM * delta;
      state.depth = (getScale() - LAYER_START_SCALE) / LAYER_SPACING;
      container.rotation += ROT_PICKUP_INCREMENT;
      positionUsingDepth(container, state.endPosX, state.endPosY, state.depth);
      container.scale.set(getScale());
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
  };
};
