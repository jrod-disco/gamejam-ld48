import * as PIXI from 'pixi.js';
import { Extract } from '@pixi/extract';
import { Renderer } from '@pixi/core';
import Color from 'color';
import { positionUsingDepth } from '@src/util/positionUsingDepth';
import { 
  APP_HEIGHT,
  APP_WIDTH,
  MAX_LAYER_DEPTH,
  MAX_LAYER_SCALE,
  LAYER_SPACING,
  LAYER_START_SCALE,
  SPEED_CAVE,
  START_ROT,
  ROT_INCREMENT,
} from '@src/constants';

Renderer.registerPlugin('extract', Extract);

export interface Cave {
  sprite: PIXI.Sprite;
  reset: () => void;
  update: (delta: number, x: number, y: number) => void;
  land: () => void;
}

interface CaveProps {
  depth: number;
}

const WATER_BOT_COLOR = Color('rgb(32, 64, 89)');
const WATER_TOP_COLOR = Color('rgb(34, 128, 220)');

/**
 * A component boiler plate for use when creating new components
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const cave = (props: CaveProps): Cave => {
  const imgNum = Math.round(Math.random() * 2) + 1;
  const caveTexture = PIXI.Texture.from(`./assets/cave/cave${imgNum}.png`);
  const sprite = new PIXI.Sprite(caveTexture);

  let state = {
    scale: LAYER_START_SCALE + (props.depth * LAYER_SPACING),
    depth: props.depth,
    landing: false,
    maxScale: MAX_LAYER_SCALE,
  };
  const initialState = { ...state };

  const getDepthColor = (): number => {
    return WATER_BOT_COLOR.mix(
      WATER_TOP_COLOR,
      state.depth / MAX_LAYER_DEPTH
    ).rgbNumber();
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    sprite.anchor.set(0.5);
    sprite.pivot.set(0.5);
    sprite.tint = getDepthColor();
    sprite.scale.set(state.scale);
    sprite.rotation = Math.random() * 360;
    positionUsingDepth(sprite, APP_WIDTH/2, APP_HEIGHT/2, state.depth);
  };
  reset();

  const update = (delta: number, x: number, y: number): void => {
    if (state.scale >= state.maxScale) {
      if (state.landing) return;
      state.scale = LAYER_START_SCALE;
      state.depth = 0;
      sprite.parent.setChildIndex(sprite, 0); // move to bottom of stack
      sprite.rotation += START_ROT;
    } else {
      state.scale += SPEED_CAVE * delta;
      state.depth = (state.scale - LAYER_START_SCALE) / LAYER_SPACING;
      sprite.rotation += ROT_INCREMENT;
    }
    if (!state.landing) {
      sprite.tint = getDepthColor();
    }
    positionUsingDepth(sprite, x, y, state.depth);
    sprite.scale.set(state.scale);
  };

  const land = (): void => {
    state.landing = true;
    state.maxScale = MAX_LAYER_SCALE * 2;
  }

  return { sprite, reset, update, land };
};
