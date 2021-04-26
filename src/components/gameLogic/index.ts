import * as PIXI from 'pixi.js';
import { BloomFilter } from '@pixi/filter-bloom';
import * as PIXISOUND from 'pixi-sound';
import {
  APP_WIDTH,
  APP_HEIGHT,
  POINTS_GOLD,
  START_LEVEL,
  IS_SCORE_INCREMENTY,
  MAX_LAYER_DEPTH,
} from '@src/constants';
import * as COMP from '..';
import { PlayerCharacter, PlayerMovement } from '../playerCharacter';
import { RunTime } from '../library/runtime';
import * as UI from '../ui';
import { Spritesheets } from '@src/core';
import { ScoreDisplay } from '../library/scoreDisplay';
import { PickupSpawner, pickupSpawner } from './pickupSpawner';
import { OxygenTank } from '../pickups';
import { Cave } from '../cave';

type Refs = {
  scoreDisplay?: ScoreDisplay;
  spriteSheets: Spritesheets;
  playerCharacter?: PlayerCharacter;
  uiContainer?: PIXI.Container;
  mainOnAudioCycleOptions?: () => void;
  mainOnGameOver?: () => void;
};

export interface GameLogic {
  update: (delta: number) => boolean;
  reset: () => void;
  //
  setRefs: (refs: Refs) => void;
  setSpriteSheet: (spriteSheets: Spritesheets) => void;
  //
  getPlayerScore: () => number;
  getCurrentLevel: () => number;
  getIsGameOver: () => boolean;
  //
  onStartGame: () => void;
  onGameOver: () => void;
}

interface Props {
  gameContainer: PIXI.Container;
  spriteSheets: Spritesheets;
  pos?: { x: number; y: number };
}

/**
 * Game Logic as a component style module
 *
 * @param props - Component properties to be set on instantiation
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const gameLogic = (props: Props): GameLogic => {
  ////////////////////////////////////////////////////////////////////////////
  // STATE
  let state = {
    keysDown: {},
    currentLevel: 0,
    currentDepth: 0,
    isGameOver: true,
    isGamePaused: false,
    playerScore: 0,
  };
  const initialState = { ...state };

  // Specific textures can be pulled out once the spritesheet ref is set
  // let targetTextures = { open: null, lock: null };
  let scoreDisplay: ScoreDisplay = null;
  let spriteSheetsRef: Spritesheets = null;
  let uiContainerRef: PIXI.Container;
  let runtime: RunTime = null;

  // TODO: move `depth` prop to playerCharacter ?
  // - add depth guage to guage cluster
  let depthMeter: UI.DepthMeter = null;
  let gauges: UI.Gauges = null;

  let pickupSpawnerRef: PickupSpawner = null;
  const caves = [];

  let mainOnGameOver: () => void = null;
  let mainOnAudioCycleOptions: () => void = null;

  const { gameContainer, spriteSheets } = props;
  gameContainer.sortableChildren = true;

  // Level Message Text
  const messageText = new PIXI.BitmapText('LEVEL UP!', {
    fontName: 'Atari-32',
    fontSize: 32,
    align: 'center',
  });
  messageText.position.x = APP_WIDTH / 2;
  messageText.position.y = 120;
  messageText.anchor.set(0.5, 0);
  messageText.alpha = 0;

  gameContainer.addChild(messageText);

  // Sound bits
  // const pixiSound = PIXISOUND.default;

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState, keysDown: {} };
  };

  ////////////////////////////////////////////////////////////////////////////
  // UI ELEMENTS

  // - References of components created in core are set here
  const setRefs = (refs: Refs): void => {
    if (refs.spriteSheets) spriteSheetsRef = refs.spriteSheets;
    if (refs.uiContainer) uiContainerRef = refs.uiContainer;
    if (refs.mainOnGameOver) mainOnGameOver = refs.mainOnGameOver;
    if (refs.mainOnAudioCycleOptions)
      mainOnAudioCycleOptions = refs.mainOnAudioCycleOptions;

    // Time ++
    runtime = COMP.LIB.runtime({
      pos: { x: 25, y: 25 },
    });
    uiContainerRef.addChild(runtime.container);

    // Depth
    depthMeter = COMP.UI.depthMeter({
      pos: { x: 25, y: 75 },
      maxDepthCallback: () => {
        console.log('MAX REACHED');
        onMaxDepthReached();
      },
      nearDepthCallback: () => {
        pickupSpawnerRef.land();
        caves.forEach((cave: Cave) => cave.land());
      },
    });
    uiContainerRef.addChild(depthMeter.container);

    // Gauges - oxygen, pressure etc
    gauges = COMP.UI.gauges({
      pos: { x: 25, y: APP_HEIGHT - 100 },
    });
    uiContainerRef.addChild(gauges.container);

    // Score Display
    scoreDisplay = COMP.LIB.scoreDisplay({
      pos: { x: APP_WIDTH - 100, y: 25 },
    });
    uiContainerRef.addChild(scoreDisplay.container);
  };

  const setSpriteSheet = (spriteSheet: Spritesheets): void => {
    spriteSheetsRef = { ...spriteSheetsRef, ...spriteSheet };
  };

  /////////////////////////////////////////////////////////////////////////////
  // GAME EVENTS

  const getIsGameOver = (): boolean => {
    return state.isGameOver;
  };
  const getPlayerScore = (): number => {
    state.playerScore = scoreDisplay.getScore();
    return state.playerScore;
  };

  const getCurrentLevel = (): number => state.currentLevel;

  // TODO: re-enable
  // const toggleGamePaused = (forceTo?: boolean): boolean => {
  //   state.isGamePaused = forceTo != undefined ? forceTo : !state.isGamePaused;

  //   if (state.isGamePaused) {
  //     messageText.text = '* GAME PAUSED *';
  //     messageText.alpha = 1;

  //     // force a render before we stop the whole app
  //     window.APP.pixiApp.render();
  //     window.APP.pixiApp.stop();
  //   } else {
  //     window.APP.pixiApp.start();
  //     gsap.to(messageText, {
  //       duration: 0.1,
  //       alpha: 0,
  //       ease: Power0.easeOut,
  //     });
  //   }

  //   return state.isGamePaused;
  // };

  /////////////////////////////////////////////////////////////////////////////
  // START GAME

  const onStartGame = (): void => {
    console.log('gameLogic: onStartGame');
    //
    state.isGameOver = false;
    state.currentLevel = START_LEVEL;
    state.playerScore = 0;
    //
    scoreDisplay.reset();
    runtime.reset();
    runtime.start();
    depthMeter.reset();
    depthMeter.start();
    playerCharacter.reset();
    caves.forEach((cave) => cave.reset());

    //

    // Start listening for keyboard events
    addOnKeyUp();
    addOnKeyDown();
  };

  /////////////////////////////////////////////////////////////////////////////
  // GAME OVER, MAN!!

  const onMaxDepthReached = (): void => {
    onGameOver();
  };

  // TODO:
  // - MAX_DEPTH reached (+ success action?)
  // - playerCharacter.integrity reaches 0
  // - playerCharacter.oxygen reaches 0

  const onGameOver = (): void => {
    console.log('gameLogic: onGameOver');
    state.isGameOver = true; // should stop updates

    // Keyboard Events
    // remove game specific key listeners if there are any
    state.keysDown = [];
    removeOnKeyUp();
    removeOnKeyDown();

    // Clean Up Component Logic and Sprites
    pickupSpawnerRef.reset();
    cleanUpPickups();

    // Clean Up Game Logic Remaining

    mainOnGameOver();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Input Handlers

  const onKeyUpGame = (event: KeyboardEvent): void => {
    // Store the fact that this key is up
    state.keysDown[event.code] = 0;
  };
  const onKeyDownGame = (event: KeyboardEvent): void => {
    // Store the fact that this key is down
    state.keysDown[event.code] = 1;
  };

  const checkDownKeys = (keysDown): void => {
    // TODO: instead of translating around the view,
    // - playercharacter will stay centered
    // - and display tilt / rotation animation

    // Map cardinal directions
    const keys = {
      left: 'KeyA',
      right: 'KeyD',
      up: 'KeyW',
      down: 'KeyS',
      arrowLeft: 'ArrowLeft',
      arrowDown: 'ArrowDown',
      arrowRight: 'ArrowRight',
      arrowUp: 'ArrowUp',
    };

    // console.log(keysDown);

    const playerMovement: PlayerMovement = { x: 0, y: 0 };

    if (keysDown[keys.left] || keysDown[keys.arrowLeft]) {
      playerMovement.x = -1;
    } else if (keysDown[keys.right] || keysDown[keys.arrowRight]) {
      playerMovement.x = 1;
    }

    if (keysDown[keys.up] || keysDown[keys.arrowUp]) {
      playerMovement.y = -1;
    } else if (keysDown[keys.down] || keysDown[keys.arrowDown]) {
      playerMovement.y = 1;
    }

    playerCharacter.setMovement(playerMovement);
  };

  const addOnKeyUp = (): void => {
    window.addEventListener('keyup', onKeyUpGame);
  };
  const removeOnKeyUp = (): void =>
    window.removeEventListener('keyup', onKeyUpGame);

  const addOnKeyDown = (): void => {
    window.addEventListener('keydown', onKeyDownGame);
  };
  const removeOnKeyDown = (): void =>
    window.removeEventListener('keydown', onKeyDownGame);

  /////////////////////////////////////////////////////////////////////////////
  // CAVE

  const caveContainer = new PIXI.Container();
  gameContainer.addChild(caveContainer);

  for (let depth = 0; depth < MAX_LAYER_DEPTH; depth++) {
    const cave = COMP.cave({ depth });
    caves.push(cave);
    caveContainer.addChild(cave.sprite);
  }

  const ambientContainer = new PIXI.Container();
  gameContainer.addChild(ambientContainer);
  ambientContainer.filters = [new BloomFilter(10)];
  // Starfield for ambient effect
  const starfield = COMP.stars({
    texture: PIXI.Texture.from('./assets/example/whitebox.png'),
  });
  ambientContainer.addChild(starfield.container);

  /////////////////////////////////////////////////////////////////////////////
  // ITEMZ

  const itemContainer = new PIXI.Container();
  gameContainer.addChild(itemContainer);
  itemContainer.filters = [new BloomFilter(6)];

  // Pickup Spawner
  pickupSpawnerRef = pickupSpawner({
    anims: spriteSheets.game.animations,
  });
  const pickupContainer = new PIXI.Container();
  itemContainer.addChild(pickupContainer);

  const updatePickups = (): void => {
    const maybePickup = pickupSpawnerRef.spawn();
    maybePickup && pickupContainer.addChild(maybePickup.container);
  };
  const cleanUpPickups = (): void => {
    pickupContainer.removeChildren();
  };

  /////////////////////////////////////////////////////////////////////////////
  // PLAYER / SUB

  const subContainer = new PIXI.Container();
  gameContainer.addChild(subContainer);
  subContainer.filters = [new BloomFilter(3)];

  // Simple Player Component
  const playerCharacter = COMP.playerCharacter({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2, rot: 0 },
    textures: {
      frontlightLeft: spriteSheets.game.textures['frontlightLeft.png'],
      frontlightRight: spriteSheets.game.textures['frontlightRight.png'],
      rearlightLeft: spriteSheets.game.textures['rearlightLeft.png'],
      rearlightRight: spriteSheets.game.textures['rearlightRight.png'],
      underglow: spriteSheets.game.textures['underglow.png'],
    },
    anims: spriteSheets.game.animations,
    gameOverHandler: () => {
      onGameOver();
    },
    gameContainer,
  });
  subContainer.addChild(playerCharacter.container);

  // TODO:
  // - abstract to class

  /////////////////////////////////////////////////////////////////////////////
  // Collision Detection
  const checkCollision = (): void => {
    if (state.isGameOver) return;

    const pX = playerCharacter.container.x;
    const pY = playerCharacter.container.y;
    const pickups = pickupSpawnerRef.getPickups();

    pickups.map((pickup) => {
      const nX = pickup.container.x;
      const nY = pickup.container.y;

      // check collision by x/y locations with a hitbox buffer
      const hitBox = 20;

      const collided =
        pX > nX - hitBox &&
        pX < nX + hitBox &&
        pY > nY - hitBox &&
        pY < nY + hitBox &&
        pickup.getScale() > 1;

      if (collided) {
        playerCharacter.consumeResource({
          getType: pickup.getType,
          getResource: pickup.getResource,
        });
        scoreDisplay.addToScore(POINTS_GOLD);
        pickup.handleCollision();
        pickup.reset();
      }
    });
  };

  // UPDATE

  const update = (delta): boolean => {
    let updateRan = false;

    if (state.isGameOver) return;
    if (state.isGamePaused) return;

    checkDownKeys(state.keysDown);
    updatePickups();

    pickupSpawnerRef.getPickups().forEach((pickup: OxygenTank): void => {
      pickup.update(delta);
    });

    playerCharacter.update({
      delta,
      depth: depthMeter.getCurrentDepth(),
      pressure: depthMeter.getCurrentPressure(),
      time: runtime.getRunTime(),
    });

    checkCollision();

    // Update individual controller refs here
    runtime.update(delta);
    depthMeter.update(delta);
    gauges.update(delta, playerCharacter.getState());

    IS_SCORE_INCREMENTY && scoreDisplay.update(delta);

    const pos = playerCharacter.getState().pos;
    caves.forEach((cave) => {
      cave.update(delta, pos.x, pos.y);
    });

    starfield.update(delta);

    updateRan = true;

    return updateRan;
  };

  return {
    update,
    reset,
    setRefs,
    setSpriteSheet,
    //
    getPlayerScore,
    getCurrentLevel,
    getIsGameOver,
    //
    onStartGame,
    onGameOver,
  };
};
