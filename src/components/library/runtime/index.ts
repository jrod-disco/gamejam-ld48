import * as PIXI from 'pixi.js';
import { THEME } from '@src/constants';

export interface RunTime {
  container: PIXI.Container;
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  update: (delta: number) => void;
  getRunTime: () => number;
}

interface Props {
  pos?: { x: number; y: number };
}

/**
 * Run Time UI. Displays how long the current run has been going/
 *
 * @param props - Standard component properties. **Plus** A reference to the Hero instance.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const runtime = (props: Props): RunTime => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'runtime';

  let state = {
    isOn: false,
    currentTime: 0,
  };

  const initialState = { ...state };

  const timeString = (): string => {
    const ts = state.currentTime.toFixed(2);
    return ts;
  };

  // Text
  const titleText = new PIXI.BitmapText('TIME', {
    fontName: `FFFFuego-16`,
    fontSize: 16,
    align: 'left',
  });
  titleText.anchor.set(0, 0);
  titleText.tint = THEME.TXT_TITLES_HEX;
  titleText.alpha = 0.8;

  const timeText = new PIXI.BitmapText('00.00', {
    fontName: `FFFFuego-16-bold`,
    fontSize: 16,
    align: 'left',
  });
  timeText.anchor.set(0, 0);
  timeText.tint = THEME.TXT_HUD_HEX;
  timeText.position.y += 20;
  timeText.position.x += 2;

  container.addChild(titleText, timeText);

  const updateTimeText = (): void => {
    timeText.text = timeString();
  };

  const getRunTime = (): number => Number(state.currentTime.toFixed(2));

  // Reset called by play again and also on init
  const reset = (): void => {
    state = null;
    state = { ...initialState };
    lastUpdateTime = Date.now();
    updateTimeText();
  };
  reset();

  let lastUpdateTime = Date.now();

  const start = (): void => {
    lastUpdateTime = Date.now();
    state = { ...state, isOn: true };
  };

  const stop = (): void => {
    state = { ...state, isOn: false, currentTime: 0 };
  };

  const pause = (): void => {
    state = { ...state, isOn: false };
  };

  const update = (delta): void => {
    // Update called by main

    if (state.isOn && Date.now() > lastUpdateTime + 10) {
      state.currentTime += 0.01;
      updateTimeText();
      lastUpdateTime = Date.now();
    }
  };

  return {
    container,
    reset,
    start,
    stop,
    pause,
    update,
    //
    getRunTime,
  };
};
