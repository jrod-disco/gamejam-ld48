import * as PIXI from 'pixi.js';
import {
  THEME,
  MAX_DEPTH,
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
  getMaxDepth: () => number;
  getCurrentDepth: () => number;
  getMaxPressure: () => number;
  getCurrentPressure: () => number;
}

interface Props {
  pos?: { x: number; y: number };
  depth?: number;
  maxDepthCallback?: () => void;
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
  const { maxDepthCallback } = props;

  let { depth } = props;

  let state = {
    isOn: false,
    currentPressure: INIT_PRESSURE,
    currentDepth: INIT_DEPTH,
  };

  const initialState = { ...state };

  const depthString = (): string => {
    const str = Math.floor(state.currentDepth).toString();
    return str;
  };

  // Text
  const titleText = new PIXI.BitmapText('DEPTH', {
    fontName: `FFFFuego-16`,
    fontSize: 16,
    align: 'left',
  });
  titleText.anchor.set(0, 0);
  titleText.tint = THEME.TXT_TITLES_HEX;
  titleText.alpha = 0.8;

  const depthText = new PIXI.BitmapText('0000', {
    fontName: `FFFFuego-16-bold`,
    fontSize: 16,
    align: 'left',
  });
  depthText.anchor.set(0, 0);
  depthText.tint = THEME.TXT_HUD_HEX;
  depthText.position.y += 20;
  depthText.position.x += 2;

  const depthMaxText = new PIXI.BitmapText('0000', {
    fontName: `FFFFuego-16-bold`,
    fontSize: 16,
    align: 'left',
  });
  depthMaxText.anchor.set(0, 0);
  depthMaxText.tint = THEME.TXT_HUD_HEX;
  depthMaxText.position.y += 36;
  depthMaxText.position.x += 2;
  depthMaxText.text = `/${MAX_DEPTH}`;

  container.addChild(titleText, depthText, depthMaxText);

  const updateDepthText = (): void => {
    depthText.text = depthString();
  };

  const getMaxDepth = (): number => depth;
  const getCurrentDepth = (): number => Number(Math.floor(state.currentDepth));
  const getMaxPressure = (): number => MAX_PRESSURE;
  const getCurrentPressure = (): number =>
    Number(Math.floor(state.currentPressure));

  // Reset called by play again and also on init
  const reset = (): void => {
    state = null;
    state = { ...initialState };
    lastUpdateTime = Date.now();
    updateDepthText();
  };
  reset();

  let lastUpdateTime = Date.now();

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
    if (!depth) return;
    if (state.currentDepth >= depth) {
      pause();
      maxDepthCallback();
    }
  };

  // UPDATE
  // - this sets the overall depth of the craft
  // - mostly this is driven by time + the descent rate const
  // - TODO: dynamically set descent rate based on power / damage etc
  const update = (delta): void => {
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
    getMaxDepth,

    getCurrentPressure,
    getMaxPressure,
  };
};
