import * as PIXI from 'pixi.js';
import gsap, { Power0, Bounce } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

import {
  APP_HEIGHT,
  APP_WIDTH,
  OBJECT_STATUS,
  PLAYER_SPEED,
  PLAYER_INIT_ROT,
  PLAYER_OXYGEN_CONSUMPTION_RATE
} from '@src/constants';

type UpdateProps = {
  delta: number;
  depth: number;
  pressure: number;
  time: number;
}

export interface PlayerCharacter {
  container: PIXI.Container;
  reset: () => void;
  update: (props: UpdateProps) => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveStop: () => void;
  takeDamage: (dmg: number) => void;
  getState: () => PlayerState;
}

interface PlayerCharacterProps {
  pos?: { x: number; y: number, rot: number };
  textures?: { playerTexture: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
  gameOverHandler?: Function;
}

type PlayerPosition = { x: number; y: number, rot: number };

enum PLAYER_DIRECTION {
  NONE,
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

type PlayerState = {
  startPos: PlayerPosition,
  status: OBJECT_STATUS,
  direction: PLAYER_DIRECTION,
  movement: PLAYER_MOVEMENT,
  movementSpeed: number,
  size: 1,
  oxygen: number,
  power: number,
  structure: number, // TODO: strengh of hull (improved by pickup ?)
  integrity: number, // TODO: health of hull
  items: [],  // TODO: ITEM types,
  lastUpdateTime: number,
}

/**
 * A simple player character
 *
 * @returns Interface object containing methods that can be called on this module
 *
 */
export const playerCharacter = (
  props: PlayerCharacterProps,
): PlayerCharacter => {

  const pos = props.pos ?? { x: 0, y: 0, rot: PLAYER_INIT_ROT };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;
  container.name = 'playerCharacter';

  // Instantiate PIXI
  PixiPlugin.registerPIXI(PIXI);
  gsap.registerPlugin(PixiPlugin);

  const { anims, textures, gameOverHandler } = props;

  let state: PlayerState = {
    startPos: { ...pos },
    status: OBJECT_STATUS.ACTIVE,
    direction: PLAYER_DIRECTION.NONE,
    movement: PLAYER_MOVEMENT.IDLE,
    movementSpeed: PLAYER_SPEED,
    size: 1,
    // 
    oxygen: 100,
    power: 100,
    structure: 100,
    integrity: 100,
    items: [],
    lastUpdateTime: Date.now(),
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

  // start small so we can grow at start
  // playerSprite.scale.set(0);
  const spriteMargin = 20;

  //
  const calculateMove = (
    currentPos: PlayerPosition,
    dir: PLAYER_MOVEMENT,
    delta: number
  ): PlayerPosition => {
    switch (dir) {
      case PLAYER_MOVEMENT.IDLE:
        break;
      case PLAYER_MOVEMENT.WALK_UP:
        return {
          x: currentPos.x,
          y: currentPos.y - state.movementSpeed * delta,
          rot: PLAYER_INIT_ROT,
        };
      case PLAYER_MOVEMENT.WALK_DOWN:
        return {
          x: currentPos.x,
          y: currentPos.y + state.movementSpeed * delta,
          rot: PLAYER_INIT_ROT,
        };
      case PLAYER_MOVEMENT.WALK_LEFT:
        return {
          x: currentPos.x - state.movementSpeed * delta,
          y: currentPos.y,
          rot: PLAYER_INIT_ROT,
        };
      case PLAYER_MOVEMENT.WALK_RIGHT:
        return {
          x: currentPos.x + state.movementSpeed * delta,
          y: currentPos.y,
          rot: PLAYER_INIT_ROT,
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
    const currentPos = { x: container.x, y: container.y, rot: container.rotation };

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
    // container.rotation = newPos.rot;
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

  // OXYGEN
  const consumeOxygen = (delta: number, pressure: number): void => {
    // as pressure increases, increase rate of consumption 
    // - rate of consumption is .05 lbs (???)
    // - start w 100 lbs of oygen (???)
    // state.oxygen = state.oxygen - PLAYER_OXYGEN_CONSUMPTION_RATE;

    state.oxygen -= PLAYER_OXYGEN_CONSUMPTION_RATE; 

    console.log("state.oxygen: %o", state.oxygen.toFixed(2) );
    if (state.oxygen < 0) {
      console.warn("you've succumbed to oxygen deprivation");
      gameOverHandler();
    }
  }
 
  // POWER

  // should be a consequence of 
  // - time as a constant drain
  // - additional power as a consequence of thrust

  // DAMAGE
  // - collision with cave wall to decrement integrity
  const takeDamage = (dmg: number): void => {
    state.integrity -= dmg;

    console.log("integrity: %o", state.integrity );
    if (state.integrity < 0) {
      console.warn("you've blown up");
      gameOverHandler();
    }
  }

  const getState = () => state;

  // Reset called by play again and also on init
  const reset = (): void => {
    container.x = state.startPos.x;
    container.y = state.startPos.y;
    // container.rotation = state.startPos.rot;
    state = { ...initialState };
  };

  const update = (props: UpdateProps): void => {
    const {
      delta,
      depth, 
      time,
      pressure,
    } = props;

    // Update called by main

    if (state.status === OBJECT_STATUS.ACTIVE) {
      updateContainer(delta);

      if (Date.now() > state.lastUpdateTime + 500) {
        state.lastUpdateTime = Date.now();
        consumeOxygen(delta, pressure);        
      }
    }
  };

  return {
    container,

    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    moveStop,

    takeDamage,

    reset,
    update,
    getState,
  };
};
