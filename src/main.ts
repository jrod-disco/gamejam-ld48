import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

import jrvascii from './util/jrvascii';
import { browserVisibility } from './util/browserVisibility';

import initPIXI, { PixiConfig } from './pixi';
import { APP_HEIGHT, APP_WIDTH, APP_NAME, APP_VERSION } from './constants';
import './index.scss';

import { Sounds } from './components/library/audio';
import * as COMP from './components';

const hostDiv = document.getElementById('canvas');
const hostWidth = APP_WIDTH;
const hostHeight = APP_WIDTH * (APP_HEIGHT / APP_WIDTH);
const pixiConfig: PixiConfig = {
  width: hostWidth,
  height: hostHeight,
  backgroundColor: 0x000000,
  antialias: false,
  resolution: window.devicePixelRatio || 1, // use resolution: 3 to scale up
};
// No anti-alias - Uncomment for pixel art
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

type SpriteSheets = {
  main: PIXI.Spritesheet | null;
};
interface BootstrapApp {
  app: PIXI.Application;
}

/**
 * @function onAssetsLoaded
 *
 * @description Callback triggered when assets are done loading. These are defined at the end of this file in the `preloader` call.
 */
const onAssetsLoaded = (): void => {
  //console.log('onAssetsLoaded');

  // Store preloade spritesheets
  const spriteSheets = {
    main: PIXI.Loader.shared.resources['mainSprites'].spritesheet,
  };
  const sounds: Sounds = {
    MainTheme: PIXI.Loader.shared.resources['MainTheme'],
  };

  // Boostrap the app once assets are loaded
  bootstrapApp({ spriteSheets, sounds });
};

/**
 * @function bootstrapApp
 *
 * @description Kicks off the application proper by instantiating the various components and wiring up their update methods to the update loop of the main application.
 *
 * @param props - Preloaded assets ({@link Spritesheets)}, {@link Sounds}) are passed in via props
 */
const bootstrapApp = (props: {
  spriteSheets: SpriteSheets;
  sounds: Sounds;
}): BootstrapApp => {
  // Throw down ye olde ASCII tag
  jrvascii();
  console.log('Built with the dCollage boilerplate.');
  console.log(`Appplication Name: ${APP_NAME}`);
  console.log(`Appplication Version: ${APP_VERSION}`);
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

  // Create a UI Container and add it to the mainContainer
  const uiContainer = mainContainer.addChild(new PIXI.Container());

  // Declare component variables in advance when needed
  let runtime = null;
  let btnSample = null;

  // Add music as a component
  const audioLayer = COMP.LIB.audio(sounds);

  // Callback for Sample "Play Again" Button
  const onPlayAgain = (): void => {
    // may want to wrap this in a conditional that assures that we should reset
    runtime.reset();
    runtime.start();
    btnSample.setEnabled(false);
    audioLayer.music.mainTheme();
  };

  // Instantiate a new Sample "Play Again" Button
  // The texture comes from a spritesheet we've preloaded
  btnSample = COMP.LIB.simpleButton({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2 },
    buttonTexture: spriteSheets.main.textures['btn_again.png'],
    onPress: onPlayAgain,
  });
  btnSample.setEnabled(true);
  // Add the button's container to the uiContainer
  uiContainer.addChild(btnSample.container);

  // Run Time is a simple clock that runs up
  runtime = COMP.LIB.runtime({ pos: { x: 25, y: 25 } });
  uiContainer.addChild(runtime.container);

  // An wxample of a component you've created - not from the prebuilt library components
  // This component's index can be used as a template for new components
  const sampleComponent = COMP.exampleComponent({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT - 50 },
  });
  mainContainer.addChild(sampleComponent.container);

  // We can also add a preloaded (or not preloaded PNG) if we wanted to
  // Usually we'll nest these in a component for more flexibility but :shrug:
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
    },
  });

  // ------------------------------------
  // Register component UPDATE routines
  // ------------------------------------
  // This is our main render loop running on RAF via PIXI
  // Some components will expose an update function which we wire up here if we want them to run on this main timeline

  pixiApp.ticker.add((delta) => {
    // Update All The Things
    runtime.update(delta);
  });

  return { app: pixiApp };
};

// Asset Preloader --------------------------------
const preloader = PIXI.Loader.shared;
preloader
  .add('samplePng', './assets/example/example.png')
  .add('mainSprites', './assets/example/sprites.json')
  .add('MainTheme', './assets/example/example.mp3');
preloader.load(onAssetsLoaded);
// Uncomment to log individual assets as they load
// preloader.onProgress.add((e, f) =>
//   console.log(`Progress ${Math.floor(e.progress)} (${f.name}.${f.extension})`)
// );
