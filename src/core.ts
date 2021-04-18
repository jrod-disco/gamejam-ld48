import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';
import * as PIXISOUND from 'pixi-sound';
import jrvascii from './util/jrvascii';
import { browserVisibility } from './util/browserVisibility';

import initPIXI, { PixiConfig } from './pixi';

import {
  APP_NAME,
  APP_VERSION,
  DCO_VERSION,
  APP_HEIGHT,
  APP_WIDTH,
  APP_BGCOLOR,
  Z_MC_BASE,
  Z_MC_UI,
} from './constants';
import './index.scss';

import * as COMP from './components';
import * as SCREENS from './screens';
import { Sounds } from './components/library/audio';

declare global {
  interface Window {
    APP: DcollageApp;
  }
}

export interface DcollageApp {
  pixiApp: PIXI.Application;
  coreInterface: any;
}

export type Spritesheets = {
  main: PIXI.Spritesheet | null;
};

const hostDiv = document.getElementById('canvas');
const hostWidth = APP_WIDTH;
const hostHeight = APP_WIDTH * (APP_HEIGHT / APP_WIDTH);
const pixiConfig: PixiConfig = {
  width: hostWidth,
  height: hostHeight,
  backgroundColor: APP_BGCOLOR,
  antialias: false,
  resolution: window.devicePixelRatio || 1, // use resolution: >1 to scale up
};
// No anti-alias - Uncomment for pixel art
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/**
 * @function bootstrapApp
 *
 * Kicks off the application proper by instantiating the various components and wiring up their update methods to the update loop of the main application.
 *
 * @param props - Preloaded assets ({@link Spritesheets)}, {@link Sounds}) are passed in via props
 *
 */
const bootstrapApp = (props: {
  spriteSheets: Spritesheets;
  sounds?: Sounds;
}): DcollageApp => {
  // Throw down ye olde ASCII tag
  jrvascii();
  console.log('Built with the dCollage boilerplate.');
  console.log(`Appplication Name: ${APP_NAME}`);
  console.log(`Built with the dCollage boilerplate ${DCO_VERSION}`);
  console.log(`Appplication Version: ${APP_VERSION}`);
  console.log('-------------------------------------------');
  // TODO Make distinction between APP_VERSION and DCO_VERSION (dCollage Boilerplate Version)

  // Instantiate PIXI
  PixiPlugin.registerPIXI(PIXI);
  gsap.registerPlugin(PixiPlugin);

  const { pixiApp, mainContainer } = initPIXI(pixiConfig, hostDiv);

  // Hide Loader GIF
  document.getElementById('loading').style.display = 'none';
  document.getElementById('footer').style.display = 'block';

  // Check for query params
  //const params = new URLSearchParams(window.location.search);

  // Handle Browser visibility changes
  let lastMutedState = null;
  const handleBrowserVisibility = (isHidden: boolean): void => {
    if (isHidden) {
      lastMutedState = audioLayer.getMutedState();
      audioLayer.muteToggle(true, true);
      pixiApp.stop();
    } else {
      audioLayer.muteToggle(lastMutedState, true);
      pixiApp.start();
    }
  };
  browserVisibility(handleBrowserVisibility);

  // Sound bits
  const pixiSound = PIXISOUND.default; //TODO: deal with persistent loading of soundeffects / also make a soundsprite already
  // Load these up on startup...
  pixiSound.add('good', './assets/example/good.mp3');

  // Get our preloader assets
  let { spriteSheets } = props;
  let sounds = props?.sounds;
  let audioLayer = null;

  // Create empty BASE and UI containers and add them to the mainContainer
  // Use constants for Z-index of these containers
  const baseContainer = mainContainer.addChildAt(
    new PIXI.Container(),
    Z_MC_BASE
  );
  const uiContainer = mainContainer.addChildAt(new PIXI.Container(), Z_MC_UI);
  baseContainer.name = 'gameContainer';
  uiContainer.name = 'uiContainer';

  // Declare component variables in advance when needed
  let runtime = null;

  const setSounds = (soundsLoaded: Sounds): void => {
    sounds = soundsLoaded;
    // Add music as a component
    audioLayer = COMP.LIB.audio(sounds);
    // Play a track
    //audioLayer.music.playRandomTrack();
  };

  //#region ** EXAMPLES OF COMPONENT USE **
  // You may want to strip this all out and do it within other use case specific modules

  // Run Time is a simple clock that runs up
  runtime = COMP.LIB.runtime({ pos: { x: 25, y: 25 } });
  uiContainer.addChild(runtime.container);

  const scoreDisplay = COMP.LIB.scoreDisplay({
    pos: { x: APP_WIDTH - 100, y: 25 },
  });
  uiContainer.addChild(scoreDisplay.container);

  // Screens UI -----------------------------------------

  // Callback for Sample "Play Again" Button
  const onSampleButtonPress = (): void => {
    // may want to wrap this in a conditional that assures that we should reset
    runtime.reset();
    runtime.start();
    SCREENS.controller.setCurrentScreen({
      name: SCREENS.ScreenName.GAME,
      isAnimated: true,
    });
    audioLayer.music.mainTheme();
  };

  // Sample Screen One - Main Screen'
  const screenMainMenu = SCREENS.mainMenuLayout({
    onSampleButtonPress,
    spriteSheets,
  });
  SCREENS.controller.addScreenToList(SCREENS.ScreenName.MAIN, screenMainMenu);

  uiContainer.addChild(screenMainMenu.container);

  // Sample Screen Two - Second Screen
  const screenGame = SCREENS.gameLayout({});
  SCREENS.controller.addScreenToList(SCREENS.ScreenName.GAME, screenGame);

  uiContainer.addChild(screenGame.container);

  //Operator: Main Screen Turn On...onViewScreen(screenMainMenu);
  SCREENS.controller.setCurrentScreen({
    name: SCREENS.ScreenName.MAIN,
    isAnimated: true,
  });

  // Audio Option Cycle
  const onAudioCycleOptions = (): void => {
    audioLayer.muteToggle();
  };

  /**
   * This does a second round of initialization once additional assets (spritesheets)
   * have been loaded up - prior to this call some modules will be null as placeholders
   * This can be used to pass secondary loaded assets to modules and set their spritesheet referecnes
   */
  const initSecondaryModules = (): void => {
    console.log('initSecondaryModules', spriteSheets);
  };

  /**
   * Brings in the secondary load set of sprites
   * will also need to trigger any module initializations that require these sprites
   */
  const setAdditionalSprites = (secondarySprites): void => {
    spriteSheets = { ...spriteSheets, ...secondarySprites };
    initSecondaryModules();
  };

  // ------------------------------------
  // Register component UPDATE routines
  // ------------------------------------
  // This is our main render loop running on RAF via PIXI
  // Some components will expose an update function which we wire up here if we want them to run on this main timeline

  pixiApp.ticker.add((delta) => {
    // Update All The Things

    // Individual components
    runtime.update(delta);

    // Update game screen only when it is visible
    const currentScreen = SCREENS.controller.getCurrentScreen();
    if (currentScreen.name === SCREENS.ScreenName.GAME)
      currentScreen.ref.update(delta);
  });

  /**
   * This project follows the revealing module pattern wherein a function
   * returns its revealed internals serving as a public interface.
   *
   *  We are further encapsulating concerns here by having only 2 top-level objects:
   *     1. pixiApp - direct access to PIXI's Application Module for lower level needs
   *     2. coreInterface - an object with additional callbacks typed as any (this could be hardned down the line)
   */
  return {
    pixiApp,
    coreInterface: {
      setSounds,
      setAdditionalSprites,
    },
  };
};

// ----- Preload Assets Here -----

/**
 * onAssetsLoaded
 * @description a callback triggered when preloader completes its work
 */
const onAssetsLoaded = (): void => {
  // Store preloaded spritesheets
  const spriteSheets = {
    main: PIXI.Loader.shared.resources['main'].spritesheet,
    //game: null, // <- game sprites are loaded and set onSecondaryAssetLoad
  };

  // This is the big boi that kicks off the whole DCollage App
  // We are storing the return on the window.APP object
  // for those few instances where we need direct access
  // to the PIXI.Application and any coreInterface functions
  window.APP = bootstrapApp({ spriteSheets });

  preloader.secondaryLoad(onSecondaryAssetsLoaded);
};

/**
 * @description a callback triggered when the secondary assets are loaded
 * These are set to load immediately following the sprites but as a separate
 * load so that they don't block the first render
 */
const onSecondaryAssetsLoaded = (): void => {
  const additionalSprites = {
    //game: PIXI.Loader.shared.resources['game'].spritesheet,
  };
  const sounds: Sounds = {
    MainTheme: PIXI.Loader.shared.resources['MainTheme'] as any,
  };
  window.APP.coreInterface.setSounds(sounds);
  window.APP.coreInterface.setAdditionalSprites(additionalSprites);
};

const preloader = COMP.LIB.preloader({});
preloader.init(onAssetsLoaded);