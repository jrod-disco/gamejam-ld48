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
  reset: (depth?: number) => void;
  update: (delta: number, x: number, y: number, level: number) => void;
  startLanding: () => void;
  isLandLayer: () => boolean;
}

interface CaveProps {
  depth: number;
  texture: PIXI.Texture;
  isLandLayer: boolean;
}

export const WATER_COLORS: Color[] = [
  Color('rgb(27, 192, 221)'),
  Color('rgb(17, 99, 144)'),
  Color('rgb(10, 30, 71)'),
  Color('rgb(3, 7, 17)'),
  Color('rgb(0, 0, 0)'),
]

/**
 * A component boiler plate for use when creating new components
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const cave = (props: CaveProps): Cave => {
  const sprite = new PIXI.Sprite(props.texture);

  let state = {
    scale: LAYER_START_SCALE + props.depth * LAYER_SPACING,
    depth: props.depth,
    landing: false,
    maxScale: MAX_LAYER_SCALE,
    isLandLayer: props.isLandLayer,
    level: 0
  };
  const initialState = { ...state };

  const getDepthColor = (): number => {
    return WATER_COLORS[state.level + 1].mix(
      WATER_COLORS[state.level],
      state.depth / MAX_LAYER_DEPTH
    ).rgbNumber();
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    if (state.isLandLayer && sprite.parent) {
      sprite.parent.removeChild(sprite);
      return;
    }
    state = { ...initialState };
    if (sprite.parent) {
      sprite.parent.setChildIndex(sprite, state.depth); // reset position
    }
    sprite.anchor.set(0.5);
    sprite.pivot.set(0.5);
    sprite.scale.set(state.scale);
    sprite.rotation = Math.random() * 360;
    if (!state.isLandLayer) {
      sprite.tint = getDepthColor();
    }
    positionUsingDepth(sprite, APP_WIDTH / 2, APP_HEIGHT / 2, state.depth);
  };
  reset();

  const update = (delta: number, x: number, y: number, level: number): void => {
    state.level = level;

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
    if (!state.landing && !state.isLandLayer) {
      sprite.tint = getDepthColor();
    }
    positionUsingDepth(sprite, x, y, state.depth);
    state.isLandLayer
      ? sprite.scale.set(state.scale * 0.35)
      : sprite.scale.set(state.scale);
  };

  const startLanding = (): void => {
    state.landing = true;
    state.maxScale = MAX_LAYER_SCALE * 2;
  };

  const isLandLayer = (): boolean => state.isLandLayer;

  return { sprite, reset, update, startLanding, isLandLayer };
};
