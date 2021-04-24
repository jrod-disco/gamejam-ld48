import * as PIXI from 'pixi.js';
import { THEME, MAX_DEPTH, PLAYER_DESCENT_RATE } from '@src/constants';

export interface DepthMeter {
  container: PIXI.Container;
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  update: (delta: number) => void;
  getCurrentDepth: () => number;
  getMaxDepth: () => number;
  setMaxDepth: (newMaxDepth: number) => void;
  setStartDepth: (newMaxDepth: number) => void;
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
  let storedMaxDepth = MAX_DEPTH;

  let state = {
    isOn: false,
    currentDepth: 0,
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

  container.addChild(titleText, depthText);

  const updateDepthText = (): void => {
    depthText.text = depthString();
  };

  const setStartDepth = (newDepth: number): void => {
    lastUpdateTime = Date.now();
    state.currentDepth = 0;
    depth = newDepth;
    storedMaxDepth = newDepth;
    updateDepthText();
  };

  const setMaxDepth = (newMaxDepth: number): void => {
    depth = newMaxDepth;
    updateDepthText();
  };

  const getMaxDepth = (): number => {
    return depth;
  };

  const getCurrentDepth = (): number => Number(Math.floor(state.currentDepth));

  // Reset called by play again and also on init
  const reset = (): void => {
    state = null;
    state = { ...initialState };
    lastUpdateTime = Date.now();
    depth = storedMaxDepth ? storedMaxDepth : MAX_DEPTH;
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
    //
    setMaxDepth,
    setStartDepth,
    //
    getCurrentDepth,
    getMaxDepth,
  };
};
