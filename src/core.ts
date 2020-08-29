import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

import jrvascii from './util/jrvascii';
import { browserVisibility } from './util/browserVisibility';

import initPIXI, { PixiConfig } from './pixi';
import {
  APP_HEIGHT,
  APP_WIDTH,
  Z_UI,
  Z_BASE,
  APP_NAME,
  APP_VERSION,
} from './constants';
import './index.scss';

import * as COMP from './components';
import * as SCREEN from './screens';
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
  backgroundColor: 0x000000,
  antialias: false,
  resolution: window.devicePixelRatio || 1, // use resolution: >1 to scale up
};
// No anti-alias - Uncomment for pixel art
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/**
 * @function bootstrapApp
 *
 * @description Kicks off the application proper by instantiating the various components and wiring up their update methods to the update loop of the main application.
 *
 * @param props - Preloaded assets ({@link Spritesheets)}, {@link Sounds}) are passed in via props
 */
const bootstrapApp = (props: {
  spriteSheets: Spritesheets;
  sounds: Sounds;
}): DcollageApp => {
  // Throw down ye olde ASCII tag
  jrvascii();
  console.log('Built with the dCollage boilerplate.');
  console.log(`Appplication Name: ${APP_NAME}`);
  console.log(`Built with the dCollage boilerplate ${APP_VERSION}`);
  console.log(`Appplication Version: ${APP_VERSION}`);
  console.log('-------------------------------------------');
  // TODO Make distinction between APP_VERSION and DCO_VERSION (dCollage Boilerplate Version)

  // Instantiate PIXI
  PixiPlugin.registerPIXI(PIXI);
  gsap.registerPlugin(PixiPlugin);
  const { pixiApp, mainContainer } = initPIXI(pixiConfig, hostDiv);
  pixiApp.renderer.autoDensity = true;

  // Handle Browser visibility changes
  const handleBrowserVisibility = (isHidden: boolean): void => {
    if (isHidden) {
      audioLayer.muteToggle(true);
      pixiApp.stop();
    } else {
      audioLayer.muteToggle(false);
      pixiApp.start();
    }
  };
  browserVisibility(handleBrowserVisibility);

  // Get our preloader assets
  const { spriteSheets, sounds } = props;

  // Create empty BASE and UI containers and add them to the mainContainer
  // Use constants for Z-index of these containers
  const baseContainer = mainContainer.addChildAt(new PIXI.Container(), Z_BASE);
  const uiContainer = mainContainer.addChildAt(new PIXI.Container(), Z_UI);

  // Declare component variables in advance when needed
  let runtime = null;

  // Add music as a component
  const audioLayer = COMP.LIB.audio(sounds);

  // Run Time is a simple clock that runs up
  runtime = COMP.LIB.runtime({ pos: { x: 25, y: 25 } });
  uiContainer.addChild(runtime.container);

  // An example of a component you've created - not from the prebuilt library components
  // This component's index can be used as a template for new components
  const sampleComponent = COMP.exampleComponent({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT - 50 },
  });

  mainContainer.addChild(sampleComponent.container);

  // We can also add a preloaded (or not preloaded PNG) if we wanted to
  // Usually we'll nest these in a component for more flexibility but it's an example

  const backgroundTexture = PIXI.Texture.from(
    './assets/example/background.png'
  );
  const backgroundSprite = new PIXI.Sprite(backgroundTexture);
  baseContainer.addChild(backgroundSprite);

  const texture = PIXI.Texture.from('./assets/example/example.png');
  const sampleSprite = new PIXI.Sprite(texture);
  sampleSprite.anchor.set(0.5);
  sampleSprite.x = APP_WIDTH / 2;
  sampleSprite.y = 50;
  mainContainer.addChild(sampleSprite);

  // We can even use Greensock to animate the resulting sprite
  gsap.to(sampleSprite, 3, {
    delay: 1,
    pixi: {
      scale: 0.5,
      angle: 360,
    },
    ease: Power0.easeOut,
    onComplete: () => {
      // tweens have callbacks too!
      console.log('tween completed. welcome to pixi with gsap');
    },
  });

  // Screens UI -----------------------------------------

  // TODO Going to need a screen manager

  // Callback for Sample "Play Again" Button
  const onSampleButtonPress = (): void => {
    // may want to wrap this in a conditional that assures that we should reset
    runtime.reset();
    runtime.start();
    SCREEN.controller.setCurrentScreen({
      screen: screenSecond,
      isAnimated: true,
    });
    audioLayer.music.mainTheme();
  };

  // Sample Screen One - Main Screen
  const screenMain = SCREEN.mainLayout({
    onSampleButtonPress,
    spriteSheets,
  });
  uiContainer.addChild(screenMain.container);

  // Sample Screen Two - Second Screen
  const screenSecond = SCREEN.secondLayout({});
  uiContainer.addChild(screenSecond.container);

  //Operator: Main Screen Turn On...
  SCREEN.controller.setCurrentScreen({
    screen: screenMain,
    isAnimated: true,
  });

  // ------------------------------------
  // Register component UPDATE routines
  // ------------------------------------
  // This is our main render loop running on RAF via PIXI
  // Some components will expose an update function which we wire up here if we want them to run on this main timeline

  pixiApp.ticker.add((delta) => {
    // Update All The Things

    // Individual components
    runtime.update(delta);

    // Update this screen only when it is visible
    if (SCREEN.controller.getCurrentScreen() === screenSecond)
      screenSecond.update(delta);
  });

  /**
   * This project follows the revealing module pattern wherein a function
   * returns its revealed internals serving as a public interface.
   *
   *  We are further encapsulating concerns here by having only 2 top-level objects:
   *     1. pixiApp - direct access to PIXI's Application Module for lower level needs
   *     2. coreInterface - an object with additional callbacks typed as any (this could be hardned down the line)
   */
  return { pixiApp, coreInterface: {} };
};

// ----- Preload Assets Here -----

/**
 * onAssetsLoaded
 * @description a callback triggered when preloader completes its work
 */
const onAssetsLoaded = (): void => {
  // Store preloaded spritesheets
  const spriteSheets = {
    main: PIXI.Loader.shared.resources['mainSprites'].spritesheet,
  };
  const sounds: Sounds = {
    MainTheme: PIXI.Loader.shared.resources['MainTheme'],
  };

  // This is the big boi that kicks off the whole DCollage App
  // We are storing the return on the window.APP object
  // for those few instances where we need direct access
  // to the PIXI.Application and any coreInterface functions
  window.APP = bootstrapApp({ spriteSheets, sounds });
};

const preloader = COMP.LIB.preloader({});
preloader.init(onAssetsLoaded);
