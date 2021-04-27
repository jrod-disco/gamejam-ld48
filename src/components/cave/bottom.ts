import * as PIXI from 'pixi.js';
import { Extract } from '@pixi/extract';
import { Renderer } from '@pixi/core';
import { positionUsingDepth } from '@src/util/positionUsingDepth';
import {
  APP_HEIGHT,
  APP_WIDTH,
} from '@src/constants';
import { WATER_COLORS } from '.';

Renderer.registerPlugin('extract', Extract);

export interface CaveBottom {
  sprite: PIXI.Sprite;
  reset: (depth?: number) => void;
  update: (delta: number, level: number) => void;
}

/**
 * A component boiler plate for use when creating new components
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const caveBottom = (): CaveBottom => {
  const square = new PIXI.Graphics();
  square.beginFill(0xFFFFFF); // White because we will tint
  square.drawRect(0, 0, APP_WIDTH, APP_HEIGHT);
  square.endFill();

  const sprite = new PIXI.Sprite();
  sprite.position.x = 0;
  sprite.position.y = 0;
  sprite.addChild(square);

  let state = {
    level: 0
  };
  const initialState = { ...state };

  const getDepthColor = (): number => WATER_COLORS[state.level + 1].rgbNumber();

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    square.tint = getDepthColor();
  };
  reset();

  const update = (delta: number, level: number): void => {
    state.level = level;
    square.tint = getDepthColor();
  };

  return { sprite, reset, update };
};
