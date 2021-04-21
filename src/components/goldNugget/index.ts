import * as PIXI from 'pixi.js';

import { APP_HEIGHT, APP_WIDTH } from '@src/constants';

export interface GoldNugget {
  container: PIXI.Container;
  reset: () => void;
}

interface GoldNuggetProps {
  pos?: { x: number; y: number };
  textures?: { nuggetTexture: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
}

type NuggetPosition = { x: number; y: number };

/**
 * A simple pick up object, a gold nugget
 *
 * @returns Interface object containing methods that can be called on this module
 *
 */
export const goldNugget = (props: GoldNuggetProps): GoldNugget => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'goldNugget';

  const { anims, textures } = props;

  let state = {
    startPos: { ...pos },
  };
  const initialState = { ...state };

  const playerContainer = new PIXI.Container();
  container.addChild(playerContainer);

  // animated sprite
  // const playerSprite = new PIXI.AnimatedSprite(anims[PLAYER_MOVEMENT.IDLE]);
  // playerContainer.addChild(playerSprite);

  // placeholder sprite
  const playerSprite = new PIXI.Sprite(textures.nuggetTexture);
  playerSprite.anchor.set(0.5);
  playerContainer.addChild(playerSprite);

  const spriteMargin = 20;

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    container.x = state.startPos.x;
    container.y = state.startPos.y;
  };
  reset();

  return {
    container,
    reset,
  };
};
