import * as PIXI from 'pixi.js';
import { zeroPad } from '@src/util/zeroPad';

import {
  THEME,
  MAX_DEPTH,
  NEAR_MAX_DEPTH,
  PLAYER_DESCENT_RATE,
  INIT_PRESSURE,
  INIT_DEPTH,
  MAX_PRESSURE,
} from '@src/constants';

export interface DepthMeter {
  container: PIXI.Container;
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  update: (delta: number) => void;
  getCurrentDepth: () => number;
  getMaxPressure: () => number;
  getCurrentPressure: () => number;
}

interface Props {
  pos?: { x: number; y: number };
  maxDepthCallback?: () => void;
  nearDepthCallback?: () => void;
}

/**
 * Run Time UI. Displays how long the current run has been going/
 *
 * @param props - Standard component properties. **Plus** A reference to the Hero instance.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const depthMeter = (props: Props): DepthMeter => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();

  container.x = pos.x;
  container.y = pos.y;
  container.name = 'depthmeter';
  const { maxDepthCallback, nearDepthCallback } = props;

  let state = {
    isOn: false,
    currentPressure: INIT_PRESSURE,
    currentDepth: INIT_DEPTH,
  };

  const initialState = { ...state };

  const depthString = (): string => {
    const str = zeroPad(Math.floor(state.currentDepth), 4);
    return str;
  };

  // Text
  const titleText = new PIXI.BitmapText('DEPTH', {
    fontName: `FFFFuego-16`,
    align: 'left',
  });
  titleText.anchor.set(0, 0);
  titleText.tint = THEME.TXT_TITLES_HEX;
  titleText.alpha = 0.8;

  const depthText = new PIXI.BitmapText('0000', {
    fontName: `FFFFuego-16-bold`,
  });
  depthText.anchor.set(0, 0);
  depthText.tint = THEME.TXT_HUD_HEX;
  depthText.position.y += 20;
  depthText.position.x += 2;

  const depthMaxText = new PIXI.BitmapText('0000', {
    fontName: `FFFFuego-16-bold`,
  });
  depthMaxText.anchor.set(0, 0);
  depthMaxText.tint = THEME.TXT_HUD_HEX;
  depthMaxText.position.y += 20;
  depthMaxText.position.x += 60;
  depthMaxText.text = `/${MAX_DEPTH}`;

  container.addChild(titleText, depthText, depthMaxText);

  const updateDepthText = (): void => {
    depthText.text = depthString();
  };

  const getCurrentDepth = (): number => Number(Math.floor(state.currentDepth));
  const getMaxPressure = (): number => MAX_PRESSURE;
  const getCurrentPressure = (): number =>
    Number(Math.floor(state.currentPressure));

  let lastUpdateTime = Date.now();

  // Reset called by play again and also on init
  const reset = (): void => {
    state = null;
    state = { ...initialState };
    lastUpdateTime = Date.now();
    updateDepthText();
  };
  reset();

  const start = (): void => {
    lastUpdateTime = Date.now();
    state = { ...state, isOn: true };
  };

  const stop = (): void => {
    state = { ...state, isOn: false, currentDepth: 0 };
  };

  const pause = (): void => {
    state = { ...state, isOn: false };
  };

  const checkMaxDepth = (): void => {
    if (state.currentDepth >= MAX_DEPTH) {
      pause();
      maxDepthCallback();
    }
    else if (state.currentDepth >= NEAR_MAX_DEPTH) {
      nearDepthCallback();
    }
  };

  // UPDATE
  // - this sets the overall depth of the craft
  // - mostly this is driven by time + the descent rate const
  // - TODO: dynamically set descent rate based on power / damage etc
  const update = (delta: number): void => {
    // Update called by main
    if (state.isOn && Date.now() > lastUpdateTime + 10) {
      state.currentDepth += PLAYER_DESCENT_RATE;

      // TODO: Pressure = (density x gravity x depth)
      // - need to introduce gravity / denisty. until then this is approx
      state.currentPressure += state.currentDepth / 5;

      checkMaxDepth();
      updateDepthText();
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

    getCurrentDepth,

    getCurrentPressure,
    getMaxPressure,
  };
};
