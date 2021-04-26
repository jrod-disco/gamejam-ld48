import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound';
import gsap, { Power0, Bounce } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

import { distanceTo2D } from '@src/util/distanceTo';
import { newShaker } from '@src/util/shakerFactory';

import {
  // consts
  SFX_VOL_MULT,
  APP_HEIGHT,
  APP_WIDTH,
  OBJECT_STATUS,
  PLAYER_MAX_SPEED,
  PLAYER_INIT_ROT,
  PLAYER_OXYGEN_CONSUMPTION_RATE,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PICKUP_TYPES,
  PLAYER_MAX_OXYGEN,
  PLAYER_ROTATE_ON_MOVE,
  PLAYER_MAX_ROT_CHANGE,
  PLAYER_SPRITE_MARGIN,
  PLAYER_COLLISION_RADIUS,
  PLAYER_COLLISION_VALUE,
  PLAYER_COLLISION_DRAG,
  // types / interface
  Resource,
  Point2D,
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
  getState: () => PlayerState;
  takeDamage: (dmg: number) => void;
  consumeResource: (resource: Resource) => void;
  setMovement: (movement: PlayerMovement) => void;
}

interface PlayerCharacterProps {
  pos?: { x: number; y: number; rot: number };
  textures?: { [key: string]: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
  gameOverHandler?: Function;
  gameContainer: PIXI.Container;
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
  FORWARD = 'sub_fwd',
  BACK = 'sub_back',
}

export type PlayerState = {
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
  isTakingDamage: boolean;
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

  const rotateOnMove = PLAYER_ROTATE_ON_MOVE;
  const maxRotationDelta = PLAYER_MAX_ROT_CHANGE;

  const pixiSound = PIXISOUND.default;
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;
  container.name = 'playerCharacter';

  // Instantiate PIXI
  PixiPlugin.registerPIXI(PIXI);
  gsap.registerPlugin(PixiPlugin);

  const { anims, textures, gameOverHandler, gameContainer } = props;

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
    isTakingDamage: false,
    lastUpdateTime: Date.now(),
  };
  const initialState = { ...state };

  // lights
  const defaultUnderglowAlpha = 0.3;
  const underLightSprite = new PIXI.Sprite(textures.underglow);
  underLightSprite.anchor.set(0.5);
  underLightSprite.x = 0;
  underLightSprite.y = 0;
  underLightSprite.alpha = defaultUnderglowAlpha;
  underLightSprite.blendMode = PIXI.BLEND_MODES.ADD;
  container.addChild(underLightSprite);

  const playerContainer = new PIXI.Container();
  container.addChild(playerContainer);

  // Build up animations
  const PLAYER_ANIM_TILT_SPEED = 0.3;
  const animIdle = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.IDLE]);
  animIdle.animationSpeed = 0.75;
  animIdle.loop = true;
  animIdle.anchor.set(0.5);
  const animTiltLeft = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.LEFT]);
  animTiltLeft.animationSpeed = PLAYER_ANIM_TILT_SPEED;
  animTiltLeft.loop = false;
  animTiltLeft.anchor.set(0.5);
  const animTiltRight = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.RIGHT]);
  animTiltRight.animationSpeed = PLAYER_ANIM_TILT_SPEED;
  animTiltRight.loop = false;
  animTiltRight.anchor.set(0.5);
  const animTiltForward = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.FORWARD]);
  animTiltForward.animationSpeed = PLAYER_ANIM_TILT_SPEED;
  animTiltForward.loop = false;
  animTiltForward.anchor.set(0.5);
  const animTiltBackward = new PIXI.AnimatedSprite(anims[PLAYER_ANIM.BACK]);
  animTiltBackward.animationSpeed = PLAYER_ANIM_TILT_SPEED;
  animTiltBackward.loop = false;
  animTiltBackward.anchor.set(0.5);

  state.lastAnim = PLAYER_ANIM.IDLE;

  const animations = {};
  animations[PLAYER_ANIM.IDLE] = animIdle;
  animations[PLAYER_ANIM.LEFT] = animTiltLeft;
  animations[PLAYER_ANIM.RIGHT] = animTiltRight;
  animations[PLAYER_ANIM.FORWARD] = animTiltForward;
  animations[PLAYER_ANIM.BACK] = animTiltBackward;

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

  const animateTiltOnMovement = (val: PlayerMovement) => {
    if (state.isTakingDamage) return;

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
        animations[state.lastAnim].animationSpeed = 0.3;
        animations[state.lastAnim].onComplete = null;
        break;
    }

    switch (val.y) {
      case 0:
        //  setAnimation(PLAYER_ANIM.IDLE);
        // animations[state.lastAnim].animationSpeed = -0.3;
        // animations[state.lastAnim].play();
        // animations[state.lastAnim].onComplete = () =>
        //   setAnimation(PLAYER_ANIM.IDLE);
        break;
      case 1:
        setAnimation(PLAYER_ANIM.BACK);
        animations[state.lastAnim].animationSpeed = 0.3;
        animations[state.lastAnim].onComplete = null;
        break;
      case -1:
        setAnimation(PLAYER_ANIM.FORWARD);
        animations[state.lastAnim].animationSpeed = 0.3;
        animations[state.lastAnim].onComplete = null;
        break;
    }
  };

  // lights
  const defaultLightAlpha = 0.35;
  const frontLightLeftSprite = new PIXI.Sprite(textures.frontlightLeft);
  frontLightLeftSprite.anchor.set(0.5, 1);
  frontLightLeftSprite.x = -84;
  frontLightLeftSprite.y = -20;
  frontLightLeftSprite.alpha = 0.5;
  frontLightLeftSprite.blendMode = PIXI.BLEND_MODES.ADD;
  container.addChild(frontLightLeftSprite);

  const frontLightRightSprite = new PIXI.Sprite(textures.frontlightRight);
  frontLightRightSprite.anchor.set(0.5, 1);
  frontLightRightSprite.x = 84;
  frontLightRightSprite.y = -20;
  frontLightRightSprite.alpha = 0.5;
  frontLightRightSprite.blendMode = PIXI.BLEND_MODES.ADD;
  container.addChild(frontLightRightSprite);

  const rearLightLeftSprite = new PIXI.Sprite(textures.rearlightLeft);
  rearLightLeftSprite.anchor.set(0.5, 1);
  rearLightLeftSprite.x = -80;
  rearLightLeftSprite.y = 125;
  rearLightLeftSprite.alpha = 0.15;
  rearLightLeftSprite.blendMode = PIXI.BLEND_MODES.ADD;
  container.addChild(rearLightLeftSprite);

  const rearLightRightSprite = new PIXI.Sprite(textures.rearlightRight);
  rearLightRightSprite.anchor.set(0.5, 1);
  rearLightRightSprite.x = 80;
  rearLightRightSprite.y = 125;
  rearLightRightSprite.alpha = 0.15;
  rearLightRightSprite.blendMode = PIXI.BLEND_MODES.ADD;
  container.addChild(rearLightRightSprite);

  const lightsList = [
    frontLightLeftSprite,
    frontLightRightSprite,
    rearLightLeftSprite,
    rearLightRightSprite,
    underLightSprite,
  ];

  const randomFlicker = () => {
    if (Math.random() < 0.85 || state.isTakingDamage) return;

    const ranIndex = Math.floor(Math.random() * lightsList.length);
    const randomLight = lightsList[ranIndex];

    let returnToAlpha;
    switch (randomLight) {
      case frontLightLeftSprite:
      case frontLightRightSprite:
        returnToAlpha = 0.5;
        break;
      case rearLightLeftSprite:
      case rearLightRightSprite:
        returnToAlpha = 0.15;
        break;
      case underLightSprite:
        returnToAlpha = 0.3;
        break;
    }

    gsap.killTweensOf(randomLight);
    randomLight.alpha = Math.random() * 0.5;
    gsap.to(randomLight, {
      duration: 0.2,
      alpha: returnToAlpha,
      ease: Power0.easeOut,
    });
  };
  const allFlicker = () => {
    lightsList.map((light) => {
      gsap.killTweensOf(light);
      light.alpha = 0;
      gsap.to(light, {
        duration: 0.5,
        alpha: 0.3,
        ease: Power0.easeOut,
      });
    });
  };

  const allGlow = () => {
    lightsList.map((light) => {
      gsap.killTweensOf(light);
      light.alpha = 0.4 + Math.random() * 0.4;
      gsap.to(light, {
        duration: 0.5,
        alpha: 0.3,
        ease: Power0.easeOut,
      });
    });
  };

  // check distance against center and collision radius
  const checkInBounds = (pos: PlayerPosition): boolean => {
    const origin: Point2D = {
      x: APP_WIDTH / 2,
      y: APP_HEIGHT / 2,
    };
    const player: Point2D = {
      x: pos.x,
      y: pos.y,
    };
    return distanceTo2D(origin, player) < PLAYER_COLLISION_RADIUS;
  };

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
    // TODO: as pressure increases, increase rate of consumption
    state.oxygen -= PLAYER_OXYGEN_CONSUMPTION_RATE;

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
  // - collision with cave wall to reduce integrity
  const screenShaker = newShaker({
    shakeAmount: 7,
    shakeCountMax: 50,
    shakeDelay: 30,
    isBidirectional: true,
    target: [gameContainer],
  });

  const takeDamage = (dmg: number): void => {
    // animate damage
    setAnimation(PLAYER_ANIM.IDLE);
    gsap.killTweensOf(container);
    state = { ...state, isTakingDamage: true };
    animIdle.tint = 0xff0000;
    gsap.to(animIdle, {
      duration: 0.25,
      pixi: { tint: 0xffffff },
      ease: Power0.easeOut,
      onComplete: () => {
        state = { ...state, isTakingDamage: false };
      },
    });

    allFlicker();

    screenShaker.shake({
      isBidirectional: true,
      shakeCountMax: 12,
      shakeAmount: 6,
      shakeDelay: 20,
    });

    pixiSound.play('player_damage', {
      volume: 1 * SFX_VOL_MULT,
    });

    state.integrity -= dmg;

    console.log('**DAMAGE** integrity: %o', state.integrity);
    if (state.integrity <= 0) {
      console.warn("you've blown up");
      gameOverHandler();
    }
  };

  //
  const consumeResource = (resource: Resource): void => {
    const type = resource.getType();
    const quantity = resource.getResource();
    allGlow();
    switch (type) {
      case PICKUP_TYPES.OXYGEN:
        state.oxygen += quantity;

        if (state.oxygen > PLAYER_MAX_OXYGEN) {
          state.oxygen = PLAYER_MAX_OXYGEN;
        }

        break;
      default:
        console.warn('whats up with this no type havin Resource crap');
    }
  };

  //
  const getState = () => state;

  //
  const updatePosition = (): void => {
    const getTargetRotation = () => {
      var { x, y } = state.movementSpeed;
      const rad = Math.PI / 2;
      if (y === 0) {
        return x < 0 ? -rad : x > 0 ? rad : state.pos.rot;
      }
      const angle = Math.atan(x / -y);
      return y > 0 ? angle + Math.PI : angle;
    };

    // this is some real 3am code here...
    const getRotation = () => {
      // Check whether it would be a shorter distance to rotate left or right, and
      // use the shortest rotation amount
      const target = getTargetRotation();
      const deltaLeft = target - state.pos.rot;
      const deltaRight = target - (state.pos.rot + Math.PI * 2);

      var delta: number;

      if (Math.abs(deltaLeft) < Math.abs(deltaRight)) {
        delta = deltaLeft;
      } else {
        delta = deltaRight;
      }
      // Put a damper on the amount that we rotate by so we don't snap immediately to the target angle
      delta *= 0.03;
      if (delta < 0 && delta < -maxRotationDelta) {
        delta = -maxRotationDelta;
      } else if (delta > 0 && delta > maxRotationDelta) {
        delta = maxRotationDelta;
      }

      return state.pos.rot + delta;
    };

    const newPos = {
      ...state.pos,
      x: state.pos.x + state.movementSpeed.x,
      y: state.pos.y + state.movementSpeed.y,
    };

    if (rotateOnMove) {
      newPos.rot = getRotation();
    }

    if (checkInBounds(newPos)) {
      state.pos = newPos;
    } else {
      // POW
      takeDamage(PLAYER_COLLISION_VALUE);
      state.movementSpeed.x *= PLAYER_COLLISION_DRAG;
      state.movementSpeed.y *= PLAYER_COLLISION_DRAG;
    }
  };

  //
  const updateContainer = (): void => {
    container.x = state.pos.x;
    container.y = state.pos.y;
    container.rotation = state.pos.rot;
  };

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
      randomFlicker();
      // attribute updates
      if (Date.now() > state.lastUpdateTime + 500) {
        state.lastUpdateTime = Date.now();
        consumeOxygen(delta, pressure);
        // resolvePressure
      }
    }
  };

  return {
    container,
    //
    setMovement,
    takeDamage,
    consumeResource,
    //
    reset,
    update,
    getState,
  };
};
