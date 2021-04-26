import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound'; // Can we preload sounds here too?
import { APP_VERSION } from '@src/constants';
export interface Preloader {
  init: (onAssetsLoadedCallback: () => void) => void;
  secondaryLoad: (onAssetsLoadedCallback: () => void) => void;
}

interface PreloaderProps {
  assetList?: Array<any>; // unused for now
}

/**
 * A non-visual asset preloader used by core
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const preloader = (props: PreloaderProps): Preloader => {
  // TODO: Implement an asset list prop
  const assetList = props?.assetList;

  /**
   * init
   * @description Kick it off!
   * @param onAssetsLoadedCallback a callback function to be triggered when assets are loaded
   */
  const preloader = PIXI.Loader.shared;
  preloader.defaultQueryString = `v${APP_VERSION}`;
  const init = (onAssetsLoadedCallback: () => void): void => {
    // Preload Assets ------------------------------------------------

    preloader
      .add('main', './assets/example/sprites.json')
      .add('ui', './assets/example/sprites-ui.json')

      .add('Atari-16', './assets/font/Atari-16.fnt')
      .add('Atari-32', './assets/font/Atari-32.fnt')

      .add('FFFCorp-16', './assets/font/FFFCorp-16.fnt')
      .add('FFFCorp-16-bold', './assets/font/FFFCorp-16-bold.fnt')

      .add('FFFFuego-16', './assets/font/FFFFuego-16.fnt')
      .add('FFFFuego-16-bold', './assets/font/FFFFuego-16-bold.fnt');

    preloader.load(onAssetsLoadedCallback);
  };

  const secondaryLoad = (onAssetsLoadedCallback: () => void): void => {
    // Sound bits
    const pixiSound = PIXISOUND.default;
    // Load these up on startup...
    pixiSound.add('good', './assets/audio/sfx_wonder_1.mp3');

    preloader
      .add('MenuTheme', './assets/audio/bg_menu_1.mp3')
      .add('MainTheme', './assets/audio/bg_menu_1.mp3')
      .add('Track1', './assets/audio/bg_upbeat_1.mp3')
      .add('Track2', './assets/audio/bg_upbeat_2.mp3')
      .add('Track3', './assets/audio/bg_slow_ambient_1.mp3')
      .add('game', './assets/deeperSprites.json');

    preloader.load(onAssetsLoadedCallback);
  };

  return { init, secondaryLoad };
};
