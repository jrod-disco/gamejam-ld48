import * as PIXI from 'pixi.js';
import gsap, { Power0, Bounce } from 'gsap';
import { PICKUP_OXYGEN_TANK_QUANTITY, PICKUP_TYPES } from '@src/constants';

export interface OxygenTank {
  container: PIXI.Container;
  getResource: () => number;
  getType: () => PICKUP_TYPES;
  reset: () => void;
}

interface OxygenTankProps {
  pos?: { x: number; y: number };
  textures?: { nuggetTexture: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
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

  const { anims, textures } = props;

  let state = {
    startPos: { ...pos },
  };
  const initialState = { ...state };

  const oxygenTankContainer = new PIXI.Container();
  container.addChild(oxygenTankContainer);

  // animated sprite
  // Spin animations
  const tankSprite = new PIXI.AnimatedSprite(anims['oxy']);
  tankSprite.animationSpeed = 0.25;
  tankSprite.loop = true;
  tankSprite.anchor.set(0.5);
  tankSprite.play();

  oxygenTankContainer.addChild(tankSprite);

  tankSprite.scale.set(0.5);
  tankSprite.alpha = 0;

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

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    container.x = state.startPos.x;
    container.y = state.startPos.y;
  };
  reset();

  // RESOURCE
  const getType = () => {
    return PICKUP_TYPES.OXYGEN;
  };

  const getResource = (): number => {
    return PICKUP_OXYGEN_TANK_QUANTITY;
  };

  return {
    container,
    reset,
    getResource,
    getType,
  };
};
