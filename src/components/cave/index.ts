import * as PIXI from 'pixi.js';
import { Extract } from '@pixi/extract';
import { Renderer } from '@pixi/core';

import Color from 'color';
import { APP_HEIGHT, APP_WIDTH, WORLD_WIDTH, WORLD_HEIGHT } from '@src/constants';

Renderer.registerPlugin('extract', Extract);

export interface Cave {
  sprite: PIXI.Sprite;
  reset: () => void;
  update: (delta: number, x: number, y: number) => void;
}

interface CaveProps {
  depth: number;
  maxDepth: number;
}

/**
 * A component boiler plate for use when creating new components
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const cave = (props: CaveProps): Cave => {
  const caveTexture = PIXI.Texture.from("./assets/cave/cave.png");
  const sprite = new PIXI.Sprite(caveTexture);

  const MAX_SCALE = 2.5;
  const WATER_BOT_COLOR = Color('rgb(32, 64, 89)');
  const WATER_TOP_COLOR = Color('rgb(34, 128, 220)');
  const START_SCALE = 0.25;
  const LAYER_SPACING = .075;
  const SCALE_INCREMENT = .001;
  const ROT_INCREMENT = 3;

  let state = {
    scale: START_SCALE + (props.depth * LAYER_SPACING),
    depth: props.depth,
    lastDepth: props.depth,
  };
  const initialState = { ...state };

  const getDepthColor = (): number => {
    return WATER_BOT_COLOR.mix(
      WATER_TOP_COLOR,
      state.depth / props.maxDepth
    ).rgbNumber();
  };

  const setPosition = (x: number, y: number): void => {
    sprite.position.x = APP_WIDTH/2 + ((APP_WIDTH/2-x)/props.maxDepth) * state.depth;
    sprite.position.y = APP_HEIGHT/2 + ((APP_HEIGHT/2-y)/props.maxDepth) * state.depth;
  };

  sprite.anchor.set(0.5);
  sprite.pivot.set(0.5);
  sprite.tint = getDepthColor();
  sprite.scale.set(state.scale);
  sprite.rotation = state.depth * ROT_INCREMENT;
  setPosition(0, 0);

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
    }
    setPosition(x, y);
    sprite.tint = getDepthColor();
    sprite.scale.set(state.scale);
  };

  return { sprite, reset, update };
};
