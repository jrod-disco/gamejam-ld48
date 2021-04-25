import * as PIXI from 'pixi.js';
import gsap, { Power0, Bounce } from 'gsap';
import { positionUsingDepth } from '@src/util/positionUsingDepth';
import { 
  PICKUP_OXYGEN_TANK_QUANTITY,
  PICKUP_TYPES,
  MAX_LAYER_SCALE,
  LAYER_SPACING,
  LAYER_START_SCALE,
  SPEED_ITEM,
  START_ROT,
  ROT_INCREMENT,
} from '@src/constants';

export interface OxygenTank {
  container: PIXI.Container;
  getResource: () => number;
  getType: () => PICKUP_TYPES;
  reset: () => void;
  update: (delta: number) => void;
}

interface OxygenTankProps {
  pos?: { x: number; y: number };
  anims?: { [key: string]: Array<PIXI.Texture> };
  depth?: number;
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
    startPos: { ...pos },
    scale: LAYER_START_SCALE + (props.depth * LAYER_SPACING),
    depth: props.depth,
  };
  const initialState = { ...state };

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

  //tankSprite.scale.set(0.5);
  //tankSprite.alpha = 0;

  // ANIMATION
  const grow = (): void => {
    gsap.killTweensOf(tankSprite);
    const myTween = gsap.to(tankSprite, {
      duration: 0.75,
      pixi: { scale: 1 },
      ease: Bounce.easeOut,
    });

    const myTweenAlpha = gsap.to(tankSprite, {
      duration: 0.5,
      pixi: { alpha: 1 },
      ease: Power0.easeOut,
    });
  };
  grow();

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
    container.scale.set(state.scale);
    container.rotation = Math.random() * 360;
    positionUsingDepth(container, state.startPos.x, state.startPos.y, state.depth);
  };
  reset();

  const update = (delta: number): void => {
    if (state.scale >= MAX_LAYER_SCALE) {
      state.scale = LAYER_START_SCALE;
      state.depth = 0;
      container.parent.setChildIndex(container, 0); // move to bottom of stack
      container.rotation += START_ROT;
    } else {
      state.scale += SPEED_ITEM * delta;
      state.depth = (state.scale - LAYER_START_SCALE) / LAYER_SPACING;
      container.rotation += ROT_INCREMENT;
    }
    positionUsingDepth(container, state.startPos.x, state.startPos.y, state.depth);
    //sprite.tint = getDepthColor();
    container.scale.set(state.scale);
  };

  return {
    container,
    reset,
    update,
    getResource,
    getType,
  };
};
