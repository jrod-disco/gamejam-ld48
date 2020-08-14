import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

import jrvascii from './util/jrvascii';
import { browserVisibility } from './util/browserVisibility';

import initPIXI, { PixiConfig } from './pixi';
import { APP_HEIGHT, APP_WIDTH } from './constants';
import './index.scss';

import * as COMP from './components';
import { Sounds } from './components/audio';
import { highScores, HighScoreManager } from './util/highScores';

const hostDiv = document.getElementById('canvas');
const hostWidth = APP_WIDTH;
const hostHeight = APP_WIDTH * (APP_HEIGHT / APP_WIDTH);
const pixiConfig: PixiConfig = {
  width: hostWidth,
  height: hostHeight,
  backgroundColor: 0x000000,
  antialias: false,
  resolution: 3, // window.devicePixelRatio || 1,
};
// No anti-alias
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

type SpriteSheets = {
  main: PIXI.Spritesheet | null;
};
interface BootstrapApp {
  app: PIXI.Application;
}

const onAssetsLoaded = (): void => {
  console.log('onAssetsLoaded');

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

const preloader = PIXI.Loader.shared;
preloader
  .add('mainSprites', './assets/sprites.json')
  .add('MainTheme', './assets/file_example_MP3_1MG.mp3');

preloader.load(onAssetsLoaded);
preloader.onProgress.add((e, f) =>
  console.log(`Progress ${Math.floor(e.progress)} (${f.name}.${f.extension})`)
);

/**
 * Kicks off the application proper by instantiating the various components and wiring up their update methods to the update loop of the main application.
 *
 * @param props - Preloaded assets ({@link Spritesheets)}, {@link Sounds}) are passed in via props
 *
 */
const bootstrapApp = (props: {
  spriteSheets: SpriteSheets;
  sounds: Sounds;
}): BootstrapApp => {
  // Throw down ye olde ASCII tag
  jrvascii();

  // Instantiate PIXI
  PixiPlugin.registerPIXI(PIXI);
  gsap.registerPlugin(PixiPlugin);
  const { pixiApp, mainContainer } = initPIXI(pixiConfig, hostDiv);
  pixiApp.renderer.autoDensity = true;

  const gameContainer = mainContainer.addChild(new PIXI.Container());
  const uiContainer = mainContainer.addChild(new PIXI.Container());

  const { spriteSheets, sounds } = props;

  // High Score Manager
  const highScoreManager: HighScoreManager = highScores();

  // Declare component variables in advance when needed
  let runtime = null;

  // Add music as a component
  const audioLayer = COMP.audio(sounds);
  //audioLayer.music.mainTheme();

  // Background
  // const bg = COMP.background({});
  // gameContainer.addChild(bg.container);

  // Best Score Display
  const bestScore = COMP.bestScoreDisplay({
    pos: { x: Math.round(APP_WIDTH * 0.5), y: 10 },
    particleTextures: [spriteSheets.main.textures['particle_3x3.png']],
  });
  uiContainer.addChild(bestScore.container);

  // Play Again Button
  let btnSample = null;

  const onPlayAgain = (): void => {
    // may want to wrap this in a conditional that assures that we should reset
    runtime.reset();
    runtime.start();
    btnSample.setEnabled(false);
    audioLayer.music.mainTheme();
    bestScore.reset();
  };

  // Play again button
  btnSample = COMP.btnSample({
    buttonTexture: spriteSheets.main.textures['btn_again.png'],
    onPress: onPlayAgain,
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2 },
  });
  btnSample.setEnabled(true);

  // Events --------------------------------------------------

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

  /**
   * Game Over sequence
   */
  const onGameOver = (): void => {
    console.log('GAME OVER');
    //audioLayer.music.somber();
    btnSample.setEnabled(true);

    // check to see if this is a personal best
    const finalScore = runtime.getRunTime();
    const isNewPersonalBest = highScoreManager.checkPersonalBest(finalScore);
    bestScore.setText(
      String(highScoreManager.getPersonalBest()),
      isNewPersonalBest
    );
    bestScore.setVisibility(true);
  };

  // Add the hero items to the game container
  //gameContainer.addChild(someComponent.container);

  // Run Time
  runtime = COMP.runtime({ pos: { x: 25, y: 25 } });
  uiContainer.addChild(runtime.container);

  uiContainer.addChild(btnSample.container);

  // Register component UPDATE routines
  // ------------------------------------
  pixiApp.ticker.add((delta) => {
    // Update All The Things

    runtime.update(delta);
    bestScore.update(delta);
  });

  return { app: pixiApp };
};
