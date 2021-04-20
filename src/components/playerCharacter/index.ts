import * as PIXI from 'pixi.js';

import {
  APP_HEIGHT,
  APP_WIDTH,
  OBJECT_STATUS,
  PLAYER_SPEED,
} from '@src/constants';

export interface PlayerCharacter {
  container: PIXI.Container;
  reset: () => void;
  update: (delta: number) => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveStop: () => void;
}

interface PlayerCharacterProps {
  pos?: { x: number; y: number };
  textures?: { playerTexture: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
}

type PlayerPosition = { x: number; y: number };

enum PLAYER_DIRECTION {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}
enum PLAYER_MOVEMENT {
  IDLE = 'idle',
  WALK_UP = 'walk_up',
  WALK_DOWN = 'walk_down',
  WALK_LEFT = 'walk_left',
  WALK_RIGHT = 'walk_right',
}

/**
 * A simple player character
 *
 * @returns Interface object containing methods that can be called on this module
 *
 */
export const playerCharacter = (
  props: PlayerCharacterProps
): PlayerCharacter => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'playerCharacter';

  const { anims, textures } = props;

  let state = {
    startPos: { ...pos },
    status: OBJECT_STATUS.ACTIVE,
    direction: PLAYER_DIRECTION.DOWN,
    movement: PLAYER_MOVEMENT.IDLE,
    movementSpeed: PLAYER_SPEED,
  };
  const initialState = { ...state };

  const playerContainer = new PIXI.Container();
  container.addChild(playerContainer);

  // animated sprite
  // const playerSprite = new PIXI.AnimatedSprite(anims[PLAYER_MOVEMENT.IDLE]);
  // playerContainer.addChild(playerSprite);

  // placeholder sprite
  const playerSprite = new PIXI.Sprite(textures.playerTexture);
  playerSprite.anchor.set(0.5);
  playerContainer.addChild(playerSprite);

  const spriteMargin = 20;

  //
  const calculateMove = (
    currentPos: PlayerPosition,
    dir: PLAYER_MOVEMENT,
    delta: number
  ): PlayerPosition => {
    switch (dir) {
      case PLAYER_MOVEMENT.IDLE:
        return;
      case PLAYER_MOVEMENT.WALK_UP:
        return {
          x: currentPos.x,
          y: currentPos.y - state.movementSpeed * delta,
        };
      case PLAYER_MOVEMENT.WALK_DOWN:
        return {
          x: currentPos.x,
          y: currentPos.y + state.movementSpeed * delta,
        };
      case PLAYER_MOVEMENT.WALK_LEFT:
        return {
          x: currentPos.x - state.movementSpeed * delta,
          y: currentPos.y,
        };
      case PLAYER_MOVEMENT.WALK_RIGHT:
        return {
          x: currentPos.x + state.movementSpeed * delta,
          y: currentPos.y,
        };
    }
  };
  //
  const checkInBounds = (pos: PlayerPosition): boolean =>
    pos.x < APP_WIDTH - spriteMargin &&
    pos.x > spriteMargin &&
    pos.y < APP_HEIGHT - spriteMargin &&
    pos.y > spriteMargin;
  //
  const setDirection = (val: PLAYER_DIRECTION): void => {
    state.direction = val;
  };
  //
  const setMovement = (val: PLAYER_MOVEMENT): void => {
    state.movement = val;
  };
  //
  const moveUpdate = (delta: number): PlayerPosition => {
    const currentPos = { x: container.x, y: container.y };

    if (state.movement === PLAYER_MOVEMENT.IDLE || state.movementSpeed === 0)
      return currentPos;

    const nextPost = calculateMove(currentPos, state.movement, delta);
    const newPos = checkInBounds(nextPost) ? nextPost : currentPos;

    return newPos;
  };
  //
  const updateContainer = (delta: number): void => {
    const newPos = moveUpdate(delta);
    container.x = newPos.x;
    container.y = newPos.y;
  };

  const moveStop = (): void => {
    setMovement(PLAYER_MOVEMENT.IDLE);
  };
  const moveUp = (): void => {
    setDirection(PLAYER_DIRECTION.UP);
    setMovement(PLAYER_MOVEMENT.WALK_UP);
  };
  const moveDown = (): void => {
    setDirection(PLAYER_DIRECTION.DOWN);
    setMovement(PLAYER_MOVEMENT.WALK_DOWN);
  };
  const moveLeft = (): void => {
    setDirection(PLAYER_DIRECTION.LEFT);
    setMovement(PLAYER_MOVEMENT.WALK_LEFT);
  };
  const moveRight = (): void => {
    setDirection(PLAYER_DIRECTION.RIGHT);
    setMovement(PLAYER_MOVEMENT.WALK_RIGHT);
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    container.x = state.startPos.x;
    container.y = state.startPos.y;
  };
  reset();

  const update = (delta): void => {
    // Update called by main
    state.status === OBJECT_STATUS.ACTIVE && updateContainer(delta);
  };

  return {
    container,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    moveStop,
    reset,
    update,
  };
};
