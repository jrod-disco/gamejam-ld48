import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound'; // Can we preload sounds here too?
export interface Preloader {
  init: (onAssetsLoadedCallback: () => void) => void;
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
  // TODO Implement an asset list prop
  const assetList = props?.assetList;

  /**
   * init
   * @description Kick it off!
   * @param onAssetsLoadedCallback a callback function to be triggered when assets are loaded
   */
  const init = (onAssetsLoadedCallback: () => void): void => {
    // Preload Assets ------------------------------------------------
    const preloader = PIXI.Loader.shared;
    preloader
      .add('samplePng', './assets/example/example.png')
      .add('mainSprites', './assets/example/sprites.json')
      .add('MainTheme', './assets/example/example.mp3');

    preloader.load(onAssetsLoadedCallback);

    // preloader.onProgress.add((e, f) =>
    //   console.log(`Progress ${Math.floor(e.progress)} (${f.name}.${f.extension})`)
    // );
  };

  return { init };
};
