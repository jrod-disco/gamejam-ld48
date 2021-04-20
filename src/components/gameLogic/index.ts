import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound';
import gsap, { Power0, Bounce } from 'gsap';
import {
  APP_WIDTH,
  APP_HEIGHT,
  SFX_VOL_MULT,
  POINTS_GOLD,
  START_LEVEL,
} from '@src/constants';
import * as COMP from '..';
import { PlayerCharacter } from '../playerCharacter';
import { RunTime } from '../library/runtime';
import { Spritesheets } from '@src/core';
import { ScoreDisplay } from '../library/scoreDisplay';

type Refs = {
  scoreDisplay?: ScoreDisplay;
  spriteSheets: Spritesheets;
  playerCharacter?: PlayerCharacter;
  runtime?: RunTime;
  mainOnAudioCycleOptions?: () => void;
  mainOnGameOver?: () => void;
};

export interface GameLogic {
  update: (delta: number) => boolean;
  reset: () => void;
  //
  setRefs: (refs: Refs) => void;
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
  let state = {
    currentLevel: 0,
    isGameOver: true,
    isGamePaused: false,
    playerScore: 0,
  };

  // Specific textures can be pulled out once the spritesheet ref is set
  // let targetTextures = { open: null, lock: null };

  // Passed in references set by setRefs function
  // The game logic component maintains references and serves as the hub for communication between all other game components
  // This is something that could likely be better served by a simple event bus but for now we live in callback hell
  let scoreDisplayRef: ScoreDisplay = null;
  let spriteSheetsRef: Spritesheets = null;
  let playerCharacterRef: PlayerCharacter = null;
  let runtimeRef: RunTime = null;
  let mainOnGameOver: () => void = null;
  let mainOnAudioCycleOptions: () => void = null;

  const initialState = { ...state };

  const { gameContainer } = props;

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
  const pixiSound = PIXISOUND.default;

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
  };

  const setRefs = (refs: Refs): void => {
    if (refs.scoreDisplay) scoreDisplayRef = refs.scoreDisplay;
    if (refs.spriteSheets) spriteSheetsRef = refs.spriteSheets;
    if (refs.playerCharacter) playerCharacterRef = refs.playerCharacter;
    if (refs.runtime) runtimeRef = refs.runtime;
    if (refs.mainOnGameOver) mainOnGameOver = refs.mainOnGameOver;
    if (refs.mainOnAudioCycleOptions)
      mainOnAudioCycleOptions = refs.mainOnAudioCycleOptions;

    // If we have sprite sheets pull out the specific textures
    // if (spriteSheetsRef)
    //   targetTextures = {
    //     open: spriteSheetsRef.game.textures['targetA_open_00'],
    //     lock: spriteSheetsRef.game.textures['targetA_lock_00'],
    //   };
  };

  const getIsGameOver = (): boolean => {
    return state.isGameOver;
  };
  const getPlayerScore = (): number => {
    state.playerScore = scoreDisplayRef.getScore();
    return state.playerScore;
  };

  const getCurrentLevel = (): number => state.currentLevel;

  const toggleGamePaused = (forceTo?: boolean): boolean => {
    state.isGamePaused = forceTo != undefined ? forceTo : !state.isGamePaused;

    if (state.isGamePaused) {
      messageText.text = '* GAME PAUSED *';
      messageText.alpha = 1;

      // force a render before we stop the whole app
      window.APP.pixiApp.render();
      window.APP.pixiApp.stop();
    } else {
      window.APP.pixiApp.start();
      gsap.to(messageText, {
        duration: 0.1,
        alpha: 0,
        ease: Power0.easeOut,
      });
    }

    return state.isGamePaused;
  };

  const onStartGame = (): void => {
    //
    state.isGameOver = false;
    state.currentLevel = START_LEVEL;
    state.playerScore = 0;
    //
    scoreDisplayRef.reset();

    runtimeRef.pause();

    //
  };

  const onGameOver = (): void => {
    // Immediately stop timer if a timed game
    // runtimeRef.pause();

    // Keyboard Events
    // remove game specific key listeners if there are any
    // window.removeEventListener('keydown', onKeyDownInGame);

    // Clean Up Component Logic and Sprites
    // ...call any controller onGameOver or reset as needed...

    // Clean Up Game Logic Remaining
    //...anything within game logic component...

    state.isGameOver = true; // should stop updates
  };

  const update = (delta): boolean => {
    let updateRan = false;
    // Update Gamplay
    if (!state.isGameOver) {
      if (!state.isGamePaused) {
        // Update individual controller refs here

        updateRan = true;
      } else {
        // Update anything that updates while game is paused
      }
    }
    return updateRan;
  };

  // This check key is not being used for SIMPLE GAME, just an example
  const checkKey = (key: string, keyCode: number): void => {
    // bail if we're not even playing
    if (state.isGameOver) return;
    //console.log(keyCode);

    // check for special keys
    // these keys should work even during no input states
    switch (keyCode) {
      // QUIT CURRENT RUN
      case 27: // Escape
        pixiSound.play('good', { loop: false, volume: 0.5 * SFX_VOL_MULT });
        mainOnGameOver();
        return;
      // AUDIO OPTION CYCLE (mute/unmute for now)
      case 220: // Backslash
        pixiSound.play('good', { loop: false, volume: 0.5 * SFX_VOL_MULT });
        mainOnAudioCycleOptions();
        return;

      // PAUSE TOGGLE
      case 13: // Enter
        toggleGamePaused();
        return;
    }

    // If we're in-game (and not blocking input) let's GO!
    if (!state.isGamePaused) {
      //
    }
  };

  // TODO: Use event.code instead - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  // note: that event.code does not return ascii values
  const onKeyDownInGame = (event: KeyboardEvent): void => {
    const { key, keyCode } = event;
    checkKey(key, keyCode);
  };

  return {
    update,
    reset,
    setRefs,
    //
    getPlayerScore,
    getCurrentLevel,
    getIsGameOver,
    //
    onStartGame,
    onGameOver,
  };
};
