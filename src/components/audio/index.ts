import * as PIXISOUND from 'pixi-sound';

interface ReturnType {
  init: () => void;
}
export const audio = (): ReturnType => {
  console.log('audio layer created');

  const pixiSound = PIXISOUND.default;

  // Load these up on startup...
  pixiSound.add('exampleSound', './assets/example/example.mp3');

  // Called when we've got all the things...
  const init = (): void => {
    pixiSound.play('exampleSound', { loop: true, volume: 0.1 });
  };

  return {
    init,
  };
};
