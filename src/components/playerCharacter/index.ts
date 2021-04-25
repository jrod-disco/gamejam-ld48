import * as PIXI from 'pixi.js';
import gsap, { Power0, Bounce } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

import {
  APP_HEIGHT,
  APP_WIDTH,
  OBJECT_STATUS,
  PLAYER_MAX_SPEED,
  PLAYER_INIT_ROT,
  PLAYER_OXYGEN_CONSUMPTION_RATE,
  PLAYER_ACCEL,
  PLAYER_DECEL,
} from '@src/constants';

type UpdateProps = {
  delta: number;
  depth: number;
  pressure: number;
  time: number;
};

export interface PlayerCharacter {
  container: PIXI.Container;
  reset: () => void;
  update: (props: UpdateProps) => void;
  takeDamage: (dmg: number) => void;
  getState: () => PlayerState;
  setMovement: (movement: PlayerMovement) => void;
}

interface PlayerCharacterProps {
  pos?: { x: number; y: number; rot: number };
  textures?: { playerTexture: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
  gameOverHandler?: Function;
}

type PlayerPosition = { x: number; y: number; rot: number };

export interface PlayerMovement {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

enum PLAYER_ANIM {
  IDLE = 'sub_center',
  LEFT = 'sub_left',
  RIGHT = 'sub_right',
}

type PlayerState = {
  startPos: PlayerPosition;
  pos: PlayerPosition;
  status: OBJECT_STATUS;
  movement: PlayerMovement;
  maxMovementSpeed: number;
  movementSpeed: { x: number; y: number };
  movementAcceleration: number;
  dragDeceleration: number;
  size: 1;
  oxygen: number;
  power: number;
  structure: number; // TODO: strengh of hull (improved by pickup ?)
  integrity: number; // TODO: health of hull
  items: []; // TODO: ITEM types
  lastAnim: PLAYER_ANIM;
  lastUpdateTime: number;
};

/**
 * A simple player character
 *
 * @returns Interface object containing methods that can be called on this module
 *
 */
export const playerCharacter = (
  props: PlayerCharacterProps
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
    pos: { ...pos },
    status: OBJECT_STATUS.ACTIVE,
    movement: { x: 0, y: 0 },
    maxMovementSpeed: PLAYER_MAX_SPEED,
    movementSpeed: { x: 0, y: 0 },
    movementAcceleration: PLAYER_ACCEL,
    dragDeceleration: PLAYER_DECEL,
    size: 1,
    //
    oxygen: 100,
    power: 100,
    structure: 100,
    integrity: 100,
    items: [],
    //
    lastAnim: PLAYER_ANIM.IDLE,
    lastUpdateTime: Date.now(),
  };
  const initialState = { ...state };

  const playerContainer = new PIXI.Container();
  container.addChild(playerContainer);

  // Build up animations
  const animIdle = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.IDLE]);
  animIdle.animationSpeed = 0.75;
  animIdle.loop = true;
  animIdle.anchor.set(0.5);
  const animTiltLeft = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.LEFT]);
  animTiltLeft.animationSpeed = 0.3;
  animTiltLeft.loop = false;
  animTiltLeft.anchor.set(0.5);
  const animTiltRight = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.RIGHT]);
  animTiltRight.animationSpeed = 0.3;
  animTiltRight.loop = false;
  animTiltRight.anchor.set(0.5);

  state.lastAnim = PLAYER_ANIM.IDLE;

  const animations = {};
  animations[PLAYER_ANIM.IDLE] = animIdle;
  animations[PLAYER_ANIM.LEFT] = animTiltLeft;
  animations[PLAYER_ANIM.RIGHT] = animTiltRight;

  playerContainer.addChild(animations[PLAYER_ANIM.IDLE]);
  animations[PLAYER_ANIM.IDLE].gotoAndPlay(0);

  const setAnimation = (anim: PLAYER_ANIM, shouldAutoPlay = true) => {
    if (anim === state.lastAnim) return;
    // only if this has changed
    playerContainer.removeChild(animations[state.lastAnim]);
    const thisAnim = playerContainer.addChild(animations[anim]);
    state = { ...state, lastAnim: anim };

    shouldAutoPlay && thisAnim.gotoAndPlay(0);
  };

  const animateTiltOnMovement = (val) => {
    switch (val.x) {
      case 0:
        //  setAnimation(PLAYER_ANIM.IDLE);
        animations[state.lastAnim].animationSpeed = -0.3;
        animations[state.lastAnim].play();
        animations[state.lastAnim].onComplete = () =>
          setAnimation(PLAYER_ANIM.IDLE);
        break;
      case 1:
        setAnimation(PLAYER_ANIM.RIGHT);
        animations[state.lastAnim].animationSpeed = 0.3;
        animations[state.lastAnim].onComplete = null;
        break;
      case -1:
        setAnimation(PLAYER_ANIM.LEFT);
        animations[state.lastAnim].animationSpeed = 0.25;
        animations[state.lastAnim].onComplete = null;
        break;
    }
  };

  // start small so we can grow at start
  // playerSprite.scale.set(0);
  const spriteMargin = 20;

  //
  const checkInBounds = (pos: PlayerPosition): boolean =>
    pos.x < APP_WIDTH - spriteMargin &&
    pos.x > spriteMargin &&
    pos.y < APP_HEIGHT - spriteMargin &&
    pos.y > spriteMargin;

  //
  const setMovement = (val: PlayerMovement): void => {
    state.movement = val;

    animateTiltOnMovement(val);
  };

  const updateSpeed = (delta: number): void => {
    // Apply a constant drag to the movement
    const applyDeceleration = (speed: number): number => {
      if (speed < 0) {
        return Math.min(speed + state.dragDeceleration * delta, 0);
      } else if (speed > 0) {
        return Math.max(speed - state.dragDeceleration * delta, 0);
      } else {
        return speed;
      }
    };

    // Accelerate if movement is requested
    const applyAcceleration = (speed: number, move: number): number =>
      speed + move * state.movementAcceleration * delta;

    // Prevent the speed from exceeding the max
    const clampSpeed = (speed: number): number => {
      if (speed < 0 && speed < -state.maxMovementSpeed)
        return -state.maxMovementSpeed;
      if (speed > 0 && speed > state.maxMovementSpeed)
        return state.maxMovementSpeed;

      return speed;
    };

    const calculateNewSpeed = (speed: number, move: number): number => {
      const withDeceleration = applyDeceleration(speed);
      const withAcceleration = applyAcceleration(withDeceleration, move);

      return clampSpeed(withAcceleration);
    };

    const newSpeed = {
      x: calculateNewSpeed(state.movementSpeed.x, state.movement.x),
      y: calculateNewSpeed(state.movementSpeed.y, state.movement.y),
    };

    state.movementSpeed = newSpeed;
  };

  // OXYGEN
  const consumeOxygen = (delta: number, pressure: number): void => {
    // as pressure increases, increase rate of consumption
    // - rate of consumption is .05 lbs (???)
    // - start w 100 lbs of oygen (???)
    // state.oxygen = state.oxygen - PLAYER_OXYGEN_CONSUMPTION_RATE;

    state.oxygen -= PLAYER_OXYGEN_CONSUMPTION_RATE;

    //  console.log('state.oxygen: %o', state.oxygen.toFixed(2));
    if (state.oxygen < 0) {
      console.warn("you've succumbed to oxygen deprivation");
      gameOverHandler();
    }
  };

  // POWER

  // should be a consequence of
  // - time as a constant drain
  // - additional power as a consequence of thrust

  // DAMAGE
  // - collision with cave wall to decrement integrity
  const takeDamage = (dmg: number): void => {
    state.integrity -= dmg;

    console.log('integrity: %o', state.integrity);
    if (state.integrity < 0) {
      console.warn("you've blown up");
      gameOverHandler();
    }
  };

  const getState = () => state;
  //
  const updatePosition = (): void => {
    const newPos = {
      ...state.pos,
      x: state.pos.x + state.movementSpeed.x,
      y: state.pos.y + state.movementSpeed.y,
    };

    if (checkInBounds(newPos)) {
      state.pos = newPos;
    }
  };

  //
  const updateContainer = (): void => {
    container.x = state.pos.x;
    container.y = state.pos.y;
    // container.rotation = state.pos.rot;
  };

  const getSize = (): number => state.size;

  // Reset called by play again and also on init
  const reset = (): void => {
    state.pos = { ...state.startPos };
    updateContainer();
    state = { ...initialState };
  };

  const update = (props: UpdateProps): void => {
    const { delta, depth, time, pressure } = props;

    // Update called by main
    if (state.status === OBJECT_STATUS.ACTIVE) {
      updateSpeed(delta);
      updatePosition();
      updateContainer();

      if (Date.now() > state.lastUpdateTime + 500) {
        state.lastUpdateTime = Date.now();
        consumeOxygen(delta, pressure);
      }
    }
  };

  return {
    container,

    setMovement,

    takeDamage,

    reset,
    update,
    getState,
  };
};
