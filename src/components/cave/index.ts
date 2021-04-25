import * as PIXI from 'pixi.js';
import { Extract } from '@pixi/extract';
import { Renderer } from '@pixi/core';

Renderer.registerPlugin('extract', Extract);

export interface Cave {
  sprite: PIXI.Sprite;
  reset: () => void;
  update: (delta: number) => void;
}

interface CaveProps {
  depth: number
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

  const MAX_SCALE = 2;
  const MAX_DEPTH = 16;
  const DEEP_BLUE = 198156;
  const START_SCALE = 0.25;
  const LAYER_SPACING = .1;
  const SCALE_INCREMENT = .001;
  const ROT_INCREMENT = 3;

  let state = {
    scale: START_SCALE + (props.depth * LAYER_SPACING),
    depth: props.depth,
    lastDepth: props.depth,
  };
  const initialState = { ...state };

  sprite.anchor.set(0.5);
  sprite.pivot.set(0.5);
  sprite.tint = DEEP_BLUE * props.depth;
  sprite.scale.set(state.scale);
  sprite.rotation = state.depth * ROT_INCREMENT;
  
  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
  };

  const update = (delta:number): void => {
    if (state.scale >= MAX_SCALE) {
      state.scale = START_SCALE;
      state.depth = state.lastDepth = 0;
      sprite.tint = DEEP_BLUE;
      sprite.parent.setChildIndex(sprite, 0);
      sprite.rotation += ROT_INCREMENT;
    }

    state.depth = Math.floor(state.scale / (MAX_SCALE / MAX_DEPTH));
    if (state.depth !== state.lastDepth) {
      state.lastDepth = state.depth;
      sprite.tint = DEEP_BLUE * state.depth;
    }

    state.scale += SCALE_INCREMENT * delta;
    sprite.scale.set(state.scale);
  };

  return { sprite, reset, update };
};
