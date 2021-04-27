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
  PLAYER_INIT_ROT,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PICKUP_TYPES,
  PLAYER_OXYGEN_CONSUMPTION_RATE,
  PLAYER_POWER_CONSUMPTION_RATE,
  PLAYER_MAX_OXYGEN,
  PLAYER_MAX_POWER,
  PLAYER_ROTATE_ON_MOVE,
  PLAYER_MAX_ROT_CHANGE,
  PLAYER_COLLISION_RADIUS,
  PLAYER_COLLISION_VALUE,
  PLAYER_COLLISION_DRAG,
  // types / interface
  Resource,
  Point2D,
  PLAYER_ROT_DAMPEN,
  PLAYER_TILT_ANGLE_THRESHOLD,
  PLAYER_TILT_SPEED_THRESHOLD,
  PLAYER_TILT_BY_ANGLE,
  PLAYER_BOOST_SCALE,
  PLAYER_BOOST_POWER_CONSUMPTION_RATE,
  PLAYER_IDLE_POWER_CONSUMPTION_RATE,
} from '@src/constants';
import {
  compareMagnitude,
  getAngle,
  getMagnitude,
  getShortestAngleDifference,
  getUnitVector,
  vAdd,
  Vector,
  vScale,
  withMagnitude,
} from '@src/util/vector';
import { clamp } from '@src/util/clamp';

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
  pos?: PlayerPosition;
  textures?: { [key: string]: PIXI.Texture };
  anims?: { [key: string]: Array<PIXI.Texture> };
  gameOverHandler?: Function;
  gameContainer: PIXI.Container;
}

type PlayerPosition = { x: number; y: number; rot: number };

export interface PlayerMovement {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
  boost: boolean;
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
  depthLevelSegment: number;
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
    movement: { x: 0, y: 0, boost: false },
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
    //
    depthLevelSegment: 0,
  };
  const initialState = { ...state };

  // lights
  const lightBlendMode = PIXI.BLEND_MODES.SCREEN;
  const defaultUnderglowAlpha = 0.2;
  const underLightSprite = new PIXI.Sprite(textures.underglow);
  underLightSprite.anchor.set(0.5);
  underLightSprite.x = 0;
  underLightSprite.y = 0;
  underLightSprite.alpha = 0;
  underLightSprite.blendMode = lightBlendMode;
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

  const tilt = (direction: PLAYER_ANIM) => {
    setAnimation(direction);
    animations[state.lastAnim].animationSpeed = 0.3;
    animations[state.lastAnim].onComplete = null;
  };

  const stopTilt = () => {
    animations[state.lastAnim].animationSpeed = -0.3;
    animations[state.lastAnim].play();
    animations[state.lastAnim].onComplete = () =>
      setAnimation(PLAYER_ANIM.IDLE);
  };

  const animateTiltByAngle = () => {
    const currentSpeed = getMagnitude(state.movementSpeed);
    const currentAngle = state.pos.rot;
    const movementAngle = getAngle(state.movementSpeed);

    const angleDifference = getShortestAngleDifference(
      currentAngle,
      movementAngle
    );

    if (angleDifference > PLAYER_TILT_ANGLE_THRESHOLD) {
      tilt(PLAYER_ANIM.RIGHT);
    } else if (angleDifference < -PLAYER_TILT_ANGLE_THRESHOLD) {
      tilt(PLAYER_ANIM.LEFT);
    } else if (currentSpeed >= PLAYER_TILT_SPEED_THRESHOLD) {
      tilt(PLAYER_ANIM.FORWARD);
    } else {
      stopTilt();
    }
  };

  const animateTiltByButton = () => {
    const { x, y } = state.movement;

    switch (x) {
      case 0:
        stopTilt();
        break;
      case 1:
        tilt(PLAYER_ANIM.RIGHT);
        break;
      case -1:
        tilt(PLAYER_ANIM.LEFT);
        break;
    }

    switch (y) {
      case 1:
        tilt(PLAYER_ANIM.BACK);
        break;
      case -1:
        tilt(PLAYER_ANIM.FORWARD);
        break;
    }
  };

  const animateTilt = () => {
    if (state.isTakingDamage) return;

    if (PLAYER_TILT_BY_ANGLE) {
      animateTiltByAngle();
    } else {
      animateTiltByButton();
    }
  };

  // lights
  const defaultLightAlpha = 0.35;
  const frontLightLeftSprite = new PIXI.Sprite(textures.frontlightLeft);
  frontLightLeftSprite.anchor.set(0.5, 1);
  frontLightLeftSprite.x = -84;
  frontLightLeftSprite.y = -20;
  frontLightLeftSprite.alpha = 0;
  frontLightLeftSprite.blendMode = lightBlendMode;
  container.addChild(frontLightLeftSprite);

  const frontLightRightSprite = new PIXI.Sprite(textures.frontlightRight);
  frontLightRightSprite.anchor.set(0.5, 1);
  frontLightRightSprite.x = 84;
  frontLightRightSprite.y = -20;
  frontLightRightSprite.alpha = 0;
  frontLightRightSprite.blendMode = lightBlendMode;
  container.addChild(frontLightRightSprite);

  const rearLightLeftSprite = new PIXI.Sprite(textures.rearlightLeft);
  rearLightLeftSprite.anchor.set(0.5, 1);
  rearLightLeftSprite.x = -80;
  rearLightLeftSprite.y = 125;
  rearLightLeftSprite.alpha = 0;
  rearLightLeftSprite.blendMode = lightBlendMode;
  container.addChild(rearLightLeftSprite);

  const rearLightRightSprite = new PIXI.Sprite(textures.rearlightRight);
  rearLightRightSprite.anchor.set(0.5, 1);
  rearLightRightSprite.x = 80;
  rearLightRightSprite.y = 125;
  rearLightRightSprite.alpha = 0;
  rearLightRightSprite.blendMode = lightBlendMode;
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
        returnToAlpha = 0.4;
        break;
      case rearLightLeftSprite:
      case rearLightRightSprite:
        returnToAlpha = 0.1;
        break;
      case underLightSprite:
        returnToAlpha = 0.2;
        break;
    }

    gsap.killTweensOf(randomLight);
    randomLight.alpha = Math.random() * 0.3;
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
        alpha: state.depthLevelSegment > 0 ? 0.3 : 0,
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
        alpha: state.depthLevelSegment > 0 ? 0.3 : 0,
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
    animateTilt();
  };

  const updateSpeed = (delta: number): void => {
    let acceleration: Vector;
    if (state.movement.boost) {
      acceleration = withMagnitude(
        state.movementSpeed,
        PLAYER_ACCEL * PLAYER_BOOST_SCALE
      );
    } else {
      const moveDir = getUnitVector(state.movement);
      acceleration = vScale(moveDir, state.movementAcceleration * delta);
    }

    const drag = vScale(state.movementSpeed, -state.dragDeceleration * delta);
    let newSpeed = vAdd(state.movementSpeed, acceleration, drag);

    state.movementSpeed = newSpeed;
  };

  // OXYGEN
  const consumeOxygen = (delta: number, pressure: number): void => {
    // TODO: as pressure increases, increase rate of consumption
    state.oxygen -= PLAYER_OXYGEN_CONSUMPTION_RATE;

    if (state.oxygen < 0) {
      state.oxygen = 0;
      console.warn("you've succumbed to oxygen deprivation");
      gameOverHandler();
    }
  };

  // POWER
  const consumePower = (delta: number): void => {
    const isMoving = state.movement.x !== 0 || state.movement.y !== 0;

    // reduce power consumption when we're not moving, and consume extra while boosting
    const rate = state.movement.boost
      ? PLAYER_BOOST_POWER_CONSUMPTION_RATE
      : isMoving
      ? PLAYER_POWER_CONSUMPTION_RATE
      : PLAYER_IDLE_POWER_CONSUMPTION_RATE;

    if (state.movement.boost) {
      pixiSound.play('motor', {
        volume: 1 * SFX_VOL_MULT,
      });
    }

    state.power -= rate * delta;

    if (state.power < 0) {
      state.power = 0;
      console.warn("you've lost all power");
      gameOverHandler();
    }
  };

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

    pixiSound.play('player_damage1', {
      volume: 1 * SFX_VOL_MULT,
    });
    pixiSound.play('player_damage2', {
      volume: (1 * SFX_VOL_MULT) / 2,
    });

    state.integrity -= dmg;

    console.log('**DAMAGE** integrity: %o', state.integrity);
    if (state.integrity <= 0) {
      state.integrity = 0;
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

      case PICKUP_TYPES.FUEL:
        state.power += quantity;
        if (state.power > PLAYER_MAX_POWER) {
          state.power = PLAYER_MAX_POWER;
        }
        break;

      default:
        console.warn('whats up with this no type havin Resource crap');
    }
  };

  //
  const getState = () => state;

  const updateRotation = (delta: number): void => {
    // Attempt to rotate the sub toward the direction of its movement

    const target = getAngle(state.movementSpeed, state.pos.rot);

    // Put a damper on the amount that we rotate by so we don't snap immediately to the target angle
    let rotationChange =
      getShortestAngleDifference(state.pos.rot, target) * PLAYER_ROT_DAMPEN;
    rotationChange = clamp(rotationChange, -maxRotationDelta, maxRotationDelta);

    let rotation = state.pos.rot + rotationChange * delta;

    // Clip the rotation to the bounds of -PI to PI
    // Otherwise we get a weird spinning effect
    const halfRotation = Math.PI;
    const fullRotation = Math.PI * 2;
    if (rotation < -halfRotation) {
      rotation += fullRotation;
    } else if (rotation >= halfRotation) {
      rotation -= fullRotation;
    }

    state.pos.rot = rotation;
  };

  const updatePosition = (): void => {
    const newCoords = vAdd(state.pos, state.movementSpeed);
    const newPos = {
      ...state.pos,
      ...newCoords,
    };

    if (checkInBounds(newPos)) {
      state.pos = newPos;
    } else {
      // POW
      takeDamage(PLAYER_COLLISION_VALUE);
      state.movementSpeed = vScale(state.movementSpeed, PLAYER_COLLISION_DRAG);
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

    // lights out
    lightsList.map((light) => {
      gsap.killTweensOf(light);
      light.alpha = 0;
    });
  };

  const update = (props: UpdateProps): void => {
    const { delta, depth, time, pressure } = props;

    // Update called by main
    if (state.status === OBJECT_STATUS.ACTIVE) {
      updateSpeed(delta);
      if (rotateOnMove) {
        updateRotation(delta);
      }
      updatePosition();
      updateContainer();

      // Depth and depth 4 segments
      const depthLevelSegment = Math.floor(depth / 1500);
      state.depthLevelSegment = depthLevelSegment;
      if (depthLevelSegment > 0) randomFlicker();

      // attribute updates
      if (Date.now() > state.lastUpdateTime + 500) {
        state.lastUpdateTime = Date.now();
        consumeOxygen(delta, pressure);
        consumePower(delta);
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
