import * as PIXISOUND from 'pixi-sound';

export interface AudioInterface {
  init: () => void;
}
export const audio = (): AudioInterface => {
  console.log('audio layer created');

  const pixiSound = PIXISOUND.default;

  // Load these up on startup...
  pixiSound.add('exampleSound', './assets/covid-collage/exampleSound.mp3');

  // Called when we've got all the things...
  const init = (): void => {
    pixiSound.play('exampleSound', { loop: true });
  };

  return {
    init,
  };
};
