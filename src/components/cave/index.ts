import * as PIXI from 'pixi.js';
import { Extract } from '@pixi/extract';
import { Renderer } from '@pixi/core';

import Color from 'color';
import { APP_HEIGHT, APP_WIDTH, MAX_CAVE_DEPTH } from '@src/constants';
import { positionUsingDepth } from '@src/util/positionUsingDepth';

Renderer.registerPlugin('extract', Extract);

export interface Cave {
  sprite: PIXI.Sprite;
  reset: () => void;
  update: (delta: number, x: number, y: number) => void;
}

interface CaveProps {
  depth: number;
}

/**
 * A component boiler plate for use when creating new components
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const cave = (props: CaveProps): Cave => {
  const num = Math.round(Math.random() * 2) + 1;
  const caveTexture = PIXI.Texture.from(`./assets/cave/cave${num}.png`);
  const sprite = new PIXI.Sprite(caveTexture);

  const MAX_SCALE = 2.5;
  const WATER_BOT_COLOR = Color('rgb(32, 64, 89)');
  const WATER_TOP_COLOR = Color('rgb(34, 128, 220)');
  const START_SCALE = 0.25;
  const LAYER_SPACING = .075;
  const SCALE_INCREMENT = .001;
  const ROT_INCREMENT = 5;

  let state = {
    scale: START_SCALE + (props.depth * LAYER_SPACING),
    depth: props.depth,
    lastDepth: props.depth,
  };
  const initialState = { ...state };

  const getDepthColor = (): number => {
    return WATER_BOT_COLOR.mix(
      WATER_TOP_COLOR,
      state.depth / MAX_CAVE_DEPTH
    ).rgbNumber();
  };

  sprite.anchor.set(0.5);
  sprite.pivot.set(0.5);
  sprite.tint = getDepthColor();
  sprite.scale.set(state.scale);
  sprite.rotation = Math.random() * 360;
  positionUsingDepth(sprite, APP_WIDTH/2, APP_HEIGHT/2, state.depth);

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
  };

  const update = (delta: number, x: number, y: number): void => {
    if (state.scale >= MAX_SCALE) {
      state.scale = START_SCALE;
      state.depth = state.lastDepth = 0;
      sprite.parent.setChildIndex(sprite, 0); // move to bottom of stack
      sprite.rotation += ROT_INCREMENT;
    } else {
      state.scale += SCALE_INCREMENT * delta;
      state.depth = (state.scale - START_SCALE) / LAYER_SPACING;
      sprite.rotation += SCALE_INCREMENT;
    }
    positionUsingDepth(sprite, x, y, state.depth);
    sprite.tint = getDepthColor();
    sprite.scale.set(state.scale);
  };

  return { sprite, reset, update };
};
